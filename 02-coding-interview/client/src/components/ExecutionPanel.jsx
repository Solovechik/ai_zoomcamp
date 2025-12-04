import { useEffect, useRef } from 'react';

function ExecutionPanel({
  output,
  onExecute,
  executing,
  pyodideLoading
}) {
  const outputRef = useRef(null);

  // Auto-scroll to bottom when new output arrives
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleExecute = () => {
    if (!pyodideLoading && !executing) {
      onExecute();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Output</h3>
        <button
          onClick={handleExecute}
          disabled={pyodideLoading || executing}
          style={{
            ...styles.button,
            ...(pyodideLoading || executing ? styles.buttonDisabled : {})
          }}
        >
          {pyodideLoading
            ? 'Loading Pyodide...'
            : executing
            ? 'Running...'
            : '▶ Run Code'}
        </button>
      </div>

      <div
        ref={outputRef}
        style={styles.output}
      >
        {!output && !executing && (
          <div style={styles.placeholder}>
            {pyodideLoading
              ? 'Loading Python runtime...'
              : 'Click "Run Code" to execute your Python code'}
          </div>
        )}

        {executing && !output && (
          <div style={styles.executing}>
            <div style={styles.spinner}></div>
            <span>Executing code...</span>
          </div>
        )}

        {output && (
          <pre style={styles.pre}>{output}</pre>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#1e1e1e',
    borderLeft: '1px solid #333',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#2d2d2d',
    borderBottom: '1px solid #333',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
  },
  button: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#28a745',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  buttonDisabled: {
    backgroundColor: '#555',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  output: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#d4d4d4',
  },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#666',
    textAlign: 'center',
    padding: '20px',
  },
  executing: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#aaa',
    gap: '12px',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '3px solid #333',
    borderTop: '3px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  pre: {
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  },
};

// Add keyframe animation for spinner
const styleSheet = document.styleSheets[0];
const keyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

try {
  styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
} catch (e) {
  // Ignore if rule already exists
}

export default ExecutionPanel;
