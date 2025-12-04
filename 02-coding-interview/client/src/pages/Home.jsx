import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession } from '../services/api';
import toast from 'react-hot-toast';
import { DEFAULT_CODE } from '../utils/constants';

function Home() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateSession = async () => {
    setLoading(true);
    try {
      const session = await createSession(DEFAULT_CODE);
      toast.success('Session created successfully!');
      navigate(`/session/${session.sessionId}`);
    } catch (error) {
      console.error('Failed to create session:', error);
      toast.error('Failed to create session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Coding Interview Platform</h1>
        <p style={styles.description}>
          Create a collaborative coding session and share the link with candidates.
          Code together in real-time with Python execution in the browser.
        </p>

        <button
          onClick={handleCreateSession}
          disabled={loading}
          style={{
            ...styles.button,
            ...(loading ? styles.buttonDisabled : {}),
          }}
        >
          {loading ? 'Creating Session...' : 'Create New Session'}
        </button>

        <div style={styles.features}>
          <h3 style={styles.featuresTitle}>Features:</h3>
          <ul style={styles.featuresList}>
            <li>Real-time collaborative code editing</li>
            <li>Python syntax highlighting</li>
            <li>Browser-based code execution (Pyodide)</li>
            <li>Shareable session links</li>
            <li>Anonymous access - no signup required</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '16px',
    textAlign: 'center',
  },
  description: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '32px',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    padding: '16px 24px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#667eea',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  features: {
    marginTop: '40px',
    paddingTop: '32px',
    borderTop: '1px solid #eee',
  },
  featuresTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '16px',
  },
  featuresList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
};

export default Home;
