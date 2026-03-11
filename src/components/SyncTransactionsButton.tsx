import React, { useState } from 'react';
import plaidService from '../services/plaidService';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';

interface SyncTransactionsButtonProps {
  onSyncComplete?: (newCount: number) => void;
}

export const SyncTransactionsButton: React.FC<SyncTransactionsButtonProps> = ({
  onSyncComplete
}) => {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      setSuccessMessage(null);

      const result = await plaidService.syncTransactions();

      if (result.success) {
        const message = result.newTransactionCount === 0
          ? 'No new transactions found.'
          : `Successfully imported ${result.newTransactionCount} new transaction${result.newTransactionCount === 1 ? '' : 's'}!`;

        setSuccessMessage(message);

        if (onSyncComplete) {
          onSyncComplete(result.newTransactionCount);
        }

        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } else {
        const errorMsg = result.errors.length > 0
          ? result.errors.join(', ')
          : 'Transaction sync failed. Please try again.';
        setError(errorMsg);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to sync transactions. Please try again.';
      setError(errorMessage);
      console.error('Error syncing transactions:', err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div style={styles.container}>
      {successMessage && (
        <div style={styles.successMessage}>
          ✓ {successMessage}
        </div>
      )}

      {error && <ErrorMessage error={error} />}

      {syncing ? (
        <LoadingSpinner size="small" message="Syncing transactions..." />
      ) : (
        <button
          onClick={handleSync}
          disabled={syncing}
          style={{
            ...styles.button,
            ...(syncing ? styles.buttonDisabled : {})
          }}
        >
          🔄 Sync Transactions
        </button>
      )}

      <div style={styles.helpText}>
        Click to manually sync transactions from your linked bank account.
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    marginBottom: '20px'
  },
  button: {
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed'
  },
  successMessage: {
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    borderRadius: '4px',
    padding: '12px',
    color: '#155724',
    fontWeight: 500
  },
  helpText: {
    fontSize: '12px',
    color: '#666',
    fontStyle: 'italic'
  }
};

export default SyncTransactionsButton;
