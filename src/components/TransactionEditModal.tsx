import React, { useState, useEffect } from 'react';
import { Transaction, TransactionRequest } from '../types/transaction';
import { TransactionForm } from './TransactionForm';

interface TransactionEditModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onSave: (id: string, data: TransactionRequest) => Promise<void>;
}

export const TransactionEditModal: React.FC<TransactionEditModalProps> = ({
  transaction,
  onClose,
  onSave
}) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset error when modal opens with new transaction
    setError(null);
  }, [transaction]);

  if (!transaction) {
    return null;
  }

  const handleSubmit = async (data: TransactionRequest) => {
    try {
      setError(null);
      await onSave(transaction.id, data);
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update transaction';
      setError(errorMessage);
      throw err; // Re-throw to let form handle it
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '8px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Edit Transaction</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        {transaction.source === 'PLAID' && transaction.plaidCategory && (
          <div
            style={{
              padding: '10px',
              backgroundColor: '#e3f2fd',
              borderRadius: '4px',
              marginBottom: '15px',
              fontSize: '14px'
            }}
          >
            <strong>Note:</strong> This is a Plaid transaction. You can change the category, but the original Plaid category 
            ({transaction.plaidCategory}) will be preserved for reference.
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '10px',
              backgroundColor: '#ffebee',
              color: '#c62828',
              borderRadius: '4px',
              marginBottom: '15px'
            }}
          >
            {error}
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
            marginTop: '10px',
            padding: '10px 20px',
            backgroundColor: '#f5f5f5',
            color: '#333',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
