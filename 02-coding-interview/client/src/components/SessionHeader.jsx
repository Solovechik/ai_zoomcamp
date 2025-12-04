import { useState } from 'react';
import toast from 'react-hot-toast';

function SessionHeader({ sessionId, participants, connected }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/session/${sessionId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }).catch((err) => {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy link');
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <h2 style={styles.title}>Coding Interview Session</h2>
        <div style={styles.sessionInfo}>
          <span style={styles.sessionId}>Session ID: <strong>{sessionId}</strong></span>
          <button
            onClick={handleCopyLink}
            style={styles.copyButton}
            title="Copy shareable link"
          >
            {copied ? '✓ Copied!' : '📋 Copy Link'}
          </button>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.statusContainer}>
          <div style={{
            ...styles.statusDot,
            ...(connected ? styles.statusDotConnected : styles.statusDotDisconnected)
          }}></div>
          <span style={styles.statusText}>
            {connected ? 'Connected' : 'Connecting...'}
          </span>
        </div>

        <div style={styles.participants}>
          <span style={styles.participantsIcon}>👥</span>
          <span style={styles.participantsCount}>
            {participants} {participants === 1 ? 'participant' : 'participants'}
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
    gap: '16px',
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    color: '#fff',
  },
  sessionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  sessionId: {
    fontSize: '14px',
    color: '#aaa',
  },
  copyButton: {
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#fff',
    backgroundColor: '#667eea',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  statusContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    transition: 'background-color 0.3s',
  },
  statusDotConnected: {
    backgroundColor: '#28a745',
    boxShadow: '0 0 8px #28a745',
  },
  statusDotDisconnected: {
    backgroundColor: '#dc3545',
  },
  statusText: {
    fontSize: '14px',
    color: '#aaa',
  },
  participants: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    backgroundColor: '#3d3d3d',
    borderRadius: '20px',
  },
  participantsIcon: {
    fontSize: '16px',
  },
  participantsCount: {
    fontSize: '14px',
    color: '#fff',
    fontWeight: '500',
  },
};

export default SessionHeader;
