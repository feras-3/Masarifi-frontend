import React, { useState, useEffect } from 'react';
import { Transaction, TransactionRequest } from '../types/transaction';
import { transactionService } from '../services/transactionService';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';
import { TransactionEditModal } from './TransactionEditModal';
import { CategoryFilter } from './CategoryFilter';

export const TransactionManagement: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [refreshTrigger]);

  const fetchTransactions = async () => {
    try {
      const response = await transactionService.getAllTransactions();
      setTransactions(response.transactions || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const handleCreateTransaction = async (data: TransactionRequest) => {
    try {
      setError(null);
      await transactionService.createTransaction(data);
      setSuccessMessage('Transaction created successfully!');
      setRefreshTrigger(prev => prev + 1);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create transaction';
      setError(errorMessage);
      throw err;
    }
  };

  const handleUpdateTransaction = async (id: string, data: TransactionRequest) => {
    try {
      setError(null);
      await transactionService.updateTransaction(id, data);
      setSuccessMessage('Transaction updated successfully!');
      setRefreshTrigger(prev => prev + 1);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update transaction';
      setError(errorMessage);
      throw err;
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      setError(null);
      await transactionService.deleteTransaction(id);
      setSuccessMessage('Transaction deleted successfully!');
      setRefreshTrigger(prev => prev + 1);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete transaction';
      setError(errorMessage);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleCloseModal = () => {
    setEditingTransaction(null);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>Transaction Management</h1>

      {error && (
        <div
          style={{
            padding: '15px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
            marginBottom: '20px'
          }}
        >
          {error}
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: '10px',
              background: 'none',
              border: 'none',
              color: '#c62828',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div
          style={{
            padding: '15px',
            backgroundColor: '#e8f5e9',
            color: '#2e7d32',
            borderRadius: '4px',
            marginBottom: '20px'
          }}
        >
          {successMessage}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '30px' }}>
        <div>
          <h2>Add New Transaction</h2>
          <TransactionForm onSubmit={handleCreateTransaction} />
        </div>

        <div>
          <CategoryFilter
            transactions={transactions}
            onFilterChange={() => {}}
          />
        </div>
      </div>

      <TransactionList
        onEdit={handleEdit}
        onDelete={handleDeleteTransaction}
        refreshTrigger={refreshTrigger}
      />

      <TransactionEditModal
        transaction={editingTransaction}
        onClose={handleCloseModal}
        onSave={handleUpdateTransaction}
      />
    </div>
  );
};
