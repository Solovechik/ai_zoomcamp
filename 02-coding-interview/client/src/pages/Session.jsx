import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import CodeEditor from '../components/CodeEditor';
import ExecutionPanel from '../components/ExecutionPanel';
import SessionHeader from '../components/SessionHeader';
import LanguageSelector from '../components/LanguageSelector';
import useSocket from '../hooks/useSocket';
import usePyodide from '../hooks/usePyodide';
import { getSession } from '../services/api';
import { executeJavaScript } from '../services/jsExecutor';

function Session() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState('# Loading...');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [participants, setParticipants] = useState(1);
  const [executing, setExecuting] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [remoteUpdateCallback, setRemoteUpdateCallback] = useState(null);

  const { socket, connected, emit, on, off } = useSocket();
  const { runCode, ready: pyodideReady, loading: pyodideLoading } = usePyodide();

  // Generate or retrieve user ID
  const [userId] = useState(() => {
    let id = localStorage.getItem('userId');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('userId', id);
    }
    return id;
  });

  // Load session data from server
  useEffect(() => {
    async function loadSession() {
      try {
        const session = await getSession(sessionId);
        setCode(session.codeContent);
        setSessionLoaded(true);
      } catch (error) {
        console.error('Failed to load session:', error);
        toast.error('Session not found');
        navigate('/');
      }
    }

    loadSession();
  }, [sessionId, navigate]);

  // Join Socket.io room and set up event listeners
  useEffect(() => {
    if (!socket || !connected || !sessionLoaded) return;

    // Join the session
    emit('join_session', { sessionId, userId });

    // Listen for session joined confirmation
    const handleSessionJoined = ({ currentCode, participants: count }) => {
      setCode(currentCode);
      setParticipants(count);
      console.log(`✓ Joined session ${sessionId} with ${count} participants`);
    };

    // Listen for code updates from other users
    const handleCodeUpdate = ({ code: newCode }) => {
      setCode(newCode);
      // Trigger remote update callback if CodeEditor has registered it
      if (remoteUpdateCallback) {
        remoteUpdateCallback(newCode);
      }
    };

    // Listen for participant changes
    const handleParticipantsChanged = ({ participants: count }) => {
      setParticipants(count);
    };

    // Listen for execution started
    const handleExecutionStarted = ({ userId: executorId }) => {
      if (executorId !== userId) {
        setExecuting(true);
        setOutput('Another user is running code...');
      }
    };

    // Listen for execution results
    const handleExecutionResult = ({ output: newOutput, error, executionTime }) => {
      if (error) {
        setOutput(`Error: ${error}\n\nExecution time: ${executionTime}`);
      } else {
        setOutput(`${newOutput}\n\nExecution time: ${executionTime}`);
      }
      setExecuting(false);
    };

    // Listen for language changes from other users
    const handleLanguageChanged = ({ language: newLanguage, code: newCode }) => {
      setLanguage(newLanguage);
      setCode(newCode);
      setOutput('');

      // Trigger remote update callback if CodeEditor has registered it
      if (remoteUpdateCallback) {
        remoteUpdateCallback(newCode);
      }

      toast.success(`Language switched to ${newLanguage === 'javascript' ? 'JavaScript' : 'Python'} by another user`);
    };

    // Listen for errors
    const handleError = ({ message }) => {
      console.error('Socket error:', message);
      toast.error(message);
    };

    on('session_joined', handleSessionJoined);
    on('code_update', handleCodeUpdate);
    on('participants_changed', handleParticipantsChanged);
    on('execution_started', handleExecutionStarted);
    on('execution_result', handleExecutionResult);
    on('language_changed', handleLanguageChanged);
    on('error', handleError);

    // Cleanup
    return () => {
      off('session_joined', handleSessionJoined);
      off('code_update', handleCodeUpdate);
      off('participants_changed', handleParticipantsChanged);
      off('execution_started', handleExecutionStarted);
      off('execution_result', handleExecutionResult);
      off('language_changed', handleLanguageChanged);
      off('error', handleError);
    };
  }, [socket, connected, sessionLoaded, sessionId, userId, emit, on, off, remoteUpdateCallback]);

  // Handle local code changes (throttled)
  const handleCodeChange = useCallback((newCode, cursorPosition) => {
    setCode(newCode);

    // Emit change to server with throttling
    if (connected) {
      emit('code_change', {
        sessionId,
        code: newCode,
        cursorPosition
      });
    }
  }, [connected, emit, sessionId]);

  // Handle code execution
  const handleExecute = useCallback(async () => {
    // For Python, wait for Pyodide to be ready
    if (language === 'python' && !pyodideReady) {
      setOutput('Pyodide is still loading...');
      return;
    }

    if (executing) return;

    setExecuting(true);
    setOutput('Running code...');

    // Notify server that execution started
    emit('execute_code', { sessionId, code, language });

    try {
      let result;

      // Execute based on language
      if (language === 'javascript') {
        result = await executeJavaScript(code);
      } else {
        result = await runCode(code);
      }

      // Send result to server to broadcast to all participants
      emit('execution_result', {
        sessionId,
        output: result.output,
        error: result.error,
        executionTime: result.executionTime,
        language
      });

      // Update local output
      if (result.error) {
        setOutput(`Error: ${result.error}\n\nExecution time: ${result.executionTime}`);
      } else {
        setOutput(`${result.output}\n\nExecution time: ${result.executionTime}`);
      }
    } catch (error) {
      const errorMessage = `Execution failed: ${error.message}`;
      setOutput(errorMessage);
      emit('execution_result', {
        sessionId,
        output: '',
        error: errorMessage,
        executionTime: '0ms',
        language
      });
    } finally {
      setExecuting(false);
    }
  }, [language, pyodideReady, executing, runCode, code, emit, sessionId]);

  // Register callback for remote code updates
  const handleRemoteChange = useCallback((callback) => {
    setRemoteUpdateCallback(() => callback);
  }, []);

  // Handle language change
  const handleLanguageChange = useCallback((newLanguage) => {
    setLanguage(newLanguage);

    // Set default code for the language
    const defaultCode = newLanguage === 'javascript'
      ? '// Write your JavaScript code here\nconsole.log("Hello, World!");'
      : '# Write your Python code here\nprint("Hello, World!")';

    setCode(defaultCode);
    setOutput('');

    // Broadcast language change to other users
    emit('language_change', { sessionId, language: newLanguage, code: defaultCode });

    toast.success(`Switched to ${newLanguage === 'javascript' ? 'JavaScript' : 'Python'}`);
  }, [emit, sessionId]);

  if (!sessionLoaded) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingSpinner}></div>
        <p>Loading session...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <SessionHeader
          sessionId={sessionId}
          participants={participants}
          connected={connected}
        />
        <LanguageSelector
          selectedLanguage={language}
          onChange={handleLanguageChange}
          disabled={!connected}
        />
      </div>

      <div style={styles.content}>
        <div style={styles.editorSection}>
          <CodeEditor
            code={code}
            language={language}
            onChange={handleCodeChange}
            onRemoteChange={handleRemoteChange}
          />
        </div>

        <div style={styles.executionSection}>
          <ExecutionPanel
            output={output}
            onExecute={handleExecute}
            executing={executing}
            pyodideLoading={pyodideLoading}
          />
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#1e1e1e',
    color: 'white',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    backgroundColor: '#2d2d2d',
    borderBottom: '2px solid #444',
  },
  content: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  editorSection: {
    flex: '1 1 60%',
    minWidth: 0,
  },
  executionSection: {
    flex: '1 1 40%',
    minWidth: 0,
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#1e1e1e',
    color: 'white',
    gap: '20px',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #333',
    borderTop: '4px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

export default Session;
