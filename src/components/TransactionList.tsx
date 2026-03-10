import React, { useState, useEffect } from 'react';
import { Transaction, TransactionSource } from '../types/transaction';
import { transactionService } from '../services/transactionService';

interface TransactionListProps {
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  refreshTrigger?: number;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  onEdit,
  onDelete,
  refreshTrigger = 0
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<'ALL' | TransactionSource>('ALL');

  useEffect(() => {
    fetchTransactions();
  }, [refreshTrigger]);

  useEffect(() => {
    applyFilter();
  }, [transactions, sourceFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await transactionService.getAllTransactions();
      setTransactions(response || []);
    } catch (err) {
      setError('Failed to load transactions. Please try again.');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (sourceFilter === 'ALL') {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(transactions.filter(t => t.source === sourceFilter));
    }
  };

  const calculateTotal = (): number => {
    return filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await onDelete(id);
        await fetchTransactions();
      } catch (err) {
        console.error('Error deleting transaction:', err);
      }
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading transactions...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
  }

  if (transactions.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        No transactions available. Add your first transaction to get started!
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Transactions</h2>
        <div>
          <label htmlFor="sourceFilter" style={{ marginRight: '10px' }}>Filter by source:</label>
          <select
            id="sourceFilter"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as 'ALL' | TransactionSource)}
            style={{
              padding: '5px 10px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            <option value="ALL">All Transactions</option>
            <option value="MANUAL">Manual Only</option>
            <option value="PLAID">Plaid Only</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
        Total: ${calculateTotal().toFixed(2)}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Date</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Description</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Merchant</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Amount</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Category</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Source</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px' }}>
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td style={{ padding: '12px' }}>{transaction.description}</td>
                <td style={{ padding: '12px' }}>
                  {transaction.merchantName || '-'}
                </td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>
                  ${transaction.amount.toFixed(2)}
                </td>
                <td style={{ padding: '12px' }}>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>{transaction.category}</span>
                    {transaction.plaidCategory && (
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        Plaid: {transaction.plaidCategory}
                      </div>
                    )}
                  </div>
                </td>
                <td style={{ padding: '12px' }}>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: transaction.source === 'PLAID' ? '#e3f2fd' : '#f5f5f5',
                      color: transaction.source === 'PLAID' ? '#1976d2' : '#666',
                      fontWeight: 'bold'
                    }}
                  >
                    {transaction.source === 'PLAID' ? '🏦 Plaid' : '✏️ Manual'}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <button
                    onClick={() => onEdit(transaction)}
                    style={{
                      padding: '5px 10px',
                      marginRight: '5px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTransactions.length === 0 && transactions.length > 0 && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          No transactions match the selected filter.
        </div>
      )}
    </div>
  );
};
