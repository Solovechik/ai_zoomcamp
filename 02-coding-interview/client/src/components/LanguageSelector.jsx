import React from 'react';

function LanguageSelector({ selectedLanguage, onChange, disabled }) {
  const languages = [
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'javascript', name: 'JavaScript', icon: '⚡' },
  ];

  return (
    <div style={styles.container}>
      <label style={styles.label}>Language:</label>
      <div style={styles.buttonGroup}>
        {languages.map((lang) => (
          <button
            key={lang.id}
            onClick={() => onChange(lang.id)}
            disabled={disabled}
            style={{
              ...styles.button,
              ...(selectedLanguage === lang.id ? styles.buttonActive : {}),
              ...(disabled ? styles.buttonDisabled : {}),
            }}
          >
            <span style={styles.icon}>{lang.icon}</span>
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#aaa',
  },
  buttonGroup: {
    display: 'flex',
    gap: '8px',
  },
  button: {
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#aaa',
    backgroundColor: '#3d3d3d',
    border: '2px solid transparent',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  buttonActive: {
    color: '#fff',
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  icon: {
    fontSize: '16px',
  },
};

export default LanguageSelector;
