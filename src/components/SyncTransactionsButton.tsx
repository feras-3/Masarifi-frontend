import React, { useState } from 'react'
import plaidService from '../services/plaidService'
import ErrorMessage from './ErrorMessage'
import LoadingSpinner from './LoadingSpinner'

interface SyncTransactionsButtonProps {
  onSyncComplete?: (newCount: number) => void
}

export const SyncTransactionsButton: React.FC<SyncTransactionsButtonProps> = ({
  onSyncComplete
}) => {
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSync = async () => {
    try {
      setSyncing(true)
      setError(null)
      setSuccessMessage(null)

      const result = await plaidService.syncTransactions()

      if (result.success) {
        const message =
          result.newTransactionCount === 0
            ? 'No new transactions found.'
            : `Successfully imported ${result.newTransactionCount} new transaction${result.newTransactionCount === 1 ? '' : 's'}!`

        setSuccessMessage(message)

        if (onSyncComplete) {
          onSyncComplete(result.newTransactionCount)
        }

        setTimeout(() => {
          setSuccessMessage(null)
        }, 5000)
      } else {
        const errorMsg =
          result.errors.length > 0
            ? result.errors.join(', ')
            : 'Transaction sync failed. Please try again.'
        setError(errorMsg)
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        'Failed to sync transactions. Please try again.'
      setError(errorMessage)
      console.error('Error syncing transactions:', err)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div style={styles.container}>
      {successMessage && (
        <div style={styles.successMessage}>✓ {successMessage}</div>
      )}

      {error && <div style={styles.errorMessage}>⚠️ {error}</div>}

      {syncing ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <span style={styles.loadingText}>Syncing transactions...</span>
        </div>
      ) : (
        <button
          onClick={handleSync}
          disabled={syncing}
          aria-label="Sync transactions from bank"
          style={{
            ...styles.button,
            ...(syncing ? styles.buttonDisabled : {})
          }}
          onMouseEnter={(e) => {
            if (!syncing) {
              e.currentTarget.style.backgroundColor = '#1976d2'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow =
                '0 4px 8px rgba(33, 150, 243, 0.3)'
            }
          }}
          onMouseLeave={(e) => {
            if (!syncing) {
              e.currentTarget.style.backgroundColor = '#2196F3'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow =
                '0 2px 4px rgba(33, 150, 243, 0.2)'
            }
          }}
        >
          <span style={{ fontSize: '18px', marginRight: '8px' }}>🔄</span>
          Sync Transactions
        </button>
      )}

      <div style={styles.helpText}>
        Manually sync transactions from your linked bank account
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    marginTop: '16px'
  },
  button: {
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '14px 24px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(33, 150, 243, 0.2)',
    minHeight: '48px'
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
    boxShadow: 'none'
  },
  successMessage: {
    backgroundColor: '#f0fff4',
    border: '1px solid #c3e6cb',
    borderRadius: '8px',
    padding: '14px 16px',
    color: '#155724',
    fontWeight: 500,
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  errorMessage: {
    backgroundColor: '#fff0f0',
    border: '1px solid #ffcdd2',
    borderRadius: '8px',
    padding: '14px 16px',
    color: '#c62828',
    fontWeight: 500,
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px',
    gap: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e0e0e0'
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '3px solid #e0e0e0',
    borderTop: '3px solid #2196F3',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    fontSize: '14px',
    color: '#666',
    fontWeight: 500
  },
  helpText: {
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.5',
    textAlign: 'center' as const
  }
}

// Add keyframe animation for spinner
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `
  document.head.appendChild(style)
}

export default SyncTransactionsButton
