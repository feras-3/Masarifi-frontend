import React, { useState, useEffect } from 'react'
import { Transaction, TransactionRequest } from '../types/transaction'
import { TransactionForm } from './TransactionForm'
import { useTheme } from '../contexts/ThemeContext'

interface TransactionEditModalProps {
  transaction: Transaction | null
  onClose: () => void
  onSave: (id: string, data: TransactionRequest) => Promise<void>
}

export const TransactionEditModal: React.FC<TransactionEditModalProps> = ({
  transaction,
  onClose,
  onSave
}) => {
  const { isDarkMode } = useTheme()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setError(null)
  }, [transaction])

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  if (!transaction) {
    return null
  }

  const handleSubmit = async (data: TransactionRequest) => {
    try {
      setError(null)
      await onSave(transaction.id, data)
      onClose()
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to update transaction'
      setError(errorMessage)
      throw err
    }
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '16px',
        overflowY: 'auto'
      }}
    >
      <div
        className="modal-content"
        style={{
          backgroundColor: isDarkMode ? '#16213e' : 'white',
          padding: '24px 20px',
          borderRadius: '12px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          animation: 'slideIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: `2px solid ${isDarkMode ? '#2c3e50' : '#f0f0f0'}`
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 700,
              color: isDarkMode ? '#e0e0e0' : '#2c3e50',
              letterSpacing: '-0.5px'
            }}
          >
            Edit Transaction
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: isDarkMode ? '#b0b0b0' : '#666',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode
                ? '#0f3460'
                : '#f5f5f5'
              e.currentTarget.style.color = isDarkMode ? '#e0e0e0' : '#333'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = isDarkMode ? '#b0b0b0' : '#666'
            }}
          >
            ×
          </button>
        </div>

        {transaction.source === 'PLAID' && transaction.plaidCategory && (
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: isDarkMode ? '#0d2847' : '#e3f2fd',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              lineHeight: '1.5',
              border: `1px solid ${isDarkMode ? '#1976d2' : '#90caf9'}`,
              color: isDarkMode ? '#90caf9' : '#1565c0'
            }}
          >
            <strong style={{ color: isDarkMode ? '#64b5f6' : '#1976d2' }}>
              ℹ️ Note:
            </strong>{' '}
            This is a Plaid transaction. You can change the category, but the
            original Plaid category ({transaction.plaidCategory}) will be
            preserved for reference.
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: isDarkMode ? '#3d1a1a' : '#fff0f0',
              color: isDarkMode ? '#ff8a80' : '#c62828',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              fontWeight: 500,
              border: `1px solid ${isDarkMode ? '#d32f2f' : '#ffcdd2'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <TransactionForm
          onSubmit={handleSubmit}
          initialData={{
            amount: transaction.amount,
            date: transaction.date,
            description: transaction.description,
            category: transaction.category
          }}
          submitLabel="Save Changes"
        />

        <button
          onClick={onClose}
          style={{
            marginTop: '16px',
            width: '100%',
            padding: '12px 24px',
            backgroundColor: isDarkMode ? '#0f3460' : '#f5f5f5',
            color: isDarkMode ? '#e0e0e0' : '#333',
            border: `1.5px solid ${isDarkMode ? '#2c3e50' : '#e0e0e0'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'all 0.2s ease',
            minHeight: '48px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDarkMode
              ? '#1a4d7a'
              : '#e0e0e0'
            e.currentTarget.style.borderColor = isDarkMode ? '#3d5a80' : '#ccc'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isDarkMode
              ? '#0f3460'
              : '#f5f5f5'
            e.currentTarget.style.borderColor = isDarkMode
              ? '#2c3e50'
              : '#e0e0e0'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
