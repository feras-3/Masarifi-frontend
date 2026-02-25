import React from 'react';

export interface ApiError {
  error?: string;
  message?: string;
  fields?: Record<string, string>;
}

export interface ErrorMessageProps {
  error: ApiError | string | null;
  onDismiss?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onDismiss }) => {
  if (!error) return null;

  // Parse error into a consistent format
  const parseError = (err: ApiError | string): { message: string; fields?: Record<string, string> } => {
    if (typeof err === 'string') {
      return { message: err };
    }
    
    return {
      message: err.message || err.error || 'An unexpected error occurred',
      fields: err.fields
    };
  };

  const { message, fields } = parseError(error);

  return (
    <div className="error-message" style={styles.container}>
      <div style={styles.header}>
        <span style={styles.icon}>⚠️</span>
        <span style={styles.message}>{message}</span>
        {onDismiss && (
          <button 
            onClick={onDismiss} 
            style={styles.dismissButton}
            aria-label="Dismiss error"
          >
            ×
          </button>
        )}
      </div>
      
      {fields && Object.keys(fields).length > 0 && (
        <div style={styles.fieldErrors}>
          {Object.entries(fields).map(([field, fieldError]) => (
            <div key={field} style={styles.fieldError}>
              <strong>{field}:</strong> {fieldError}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '4px',
    padding: '12px',
    marginBottom: '16px',
    color: '#c33',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  icon: {
    fontSize: '18px',
  },
  message: {
    flex: 1,
    fontWeight: 500,
  },
  dismissButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: '#c33',
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: 1,
  },
  fieldErrors: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #fcc',
  },
  fieldError: {
    marginTop: '4px',
    fontSize: '14px',
  },
};

export default ErrorMessage;
