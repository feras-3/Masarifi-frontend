import React, { useState, useEffect } from 'react'
import { Transaction, TransactionSource, Category } from '../types/transaction'
import { transactionService } from '../services/transactionService'

interface TransactionListProps {
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
  refreshTrigger?: number
}

export const TransactionList: React.FC<TransactionListProps> = ({
  onEdit,
  onDelete,
  refreshTrigger = 0
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sourceFilter, setSourceFilter] = useState<'ALL' | TransactionSource>(
    'ALL'
  )
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | Category>('ALL')

  useEffect(() => {
    fetchTransactions()
  }, [refreshTrigger])

  useEffect(() => {
    applyFilters()
  }, [transactions, sourceFilter, categoryFilter])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await transactionService.getAllTransactions()
      setTransactions(response || [])
    } catch (err) {
      setError('Failed to load transactions. Please try again.')
      console.error('Error fetching transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = transactions

    if (sourceFilter !== 'ALL') {
      filtered = filtered.filter((t) => t.source === sourceFilter)
    }

    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter((t) => t.category === categoryFilter)
    }

    setFilteredTransactions(filtered)
  }

  const calculateTotal = (): number => {
    return filteredTransactions.reduce((sum, t) => sum + t.amount, 0)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        onDelete(id)
        await fetchTransactions()
      } catch (err) {
        console.error('Error deleting transaction:', err)
      }
    }
  }

  if (loading) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          color: '#666',
          fontSize: '15px'
        }}
      >
        Loading transactions...
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          padding: '20px',
          margin: '20px',
          backgroundColor: '#ffebee',
          border: '1px solid #ef5350',
          borderRadius: '8px',
          color: '#c62828'
        }}
      >
        {error}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div
        style={{
          padding: '60px 20px',
          textAlign: 'center',
          color: '#999',
          fontSize: '15px'
        }}
      >
        No transactions available. Add your first transaction to get started!
      </div>
    )
  }

  return (
    <div style={{ padding: '0' }}>
      {/* Header Section */}
      <div
        style={{
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h2
            style={{
              margin: '0 0 8px 0',
              fontSize: '24px',
              fontWeight: 600,
              color: '#2c3e50'
            }}
          >
            Transactions
          </h2>
          <div
            style={{
              fontSize: '15px',
              color: '#666',
              fontWeight: 500
            }}
          >
            {filteredTransactions.length} transaction
            {filteredTransactions.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label
              htmlFor="categoryFilter"
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#555'
              }}
            >
              Category:
            </label>
            <select
              id="categoryFilter"
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as 'ALL' | Category)
              }
              style={{
                padding: '8px 32px 8px 12px',
                border: '1.5px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                backgroundColor: 'white',
                cursor: 'pointer',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            >
              <option value="ALL">All Categories</option>
              {Object.values(Category).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label
              htmlFor="sourceFilter"
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#555'
              }}
            >
              Source:
            </label>
            <select
              id="sourceFilter"
              value={sourceFilter}
              onChange={(e) =>
                setSourceFilter(e.target.value as 'ALL' | TransactionSource)
              }
              style={{
                padding: '8px 32px 8px 12px',
                border: '1.5px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                backgroundColor: 'white',
                cursor: 'pointer',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            >
              <option value="ALL">All Sources</option>
              <option value="MANUAL">Manual Only</option>
              <option value="PLAID">Plaid Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Total Section */}
      <div
        style={{
          marginBottom: '24px',
          padding: '16px 20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '10px',
          border: '1px solid #e9ecef'
        }}
      >
        <div
          style={{
            fontSize: '13px',
            color: '#666',
            marginBottom: '4px',
            fontWeight: 500
          }}
        >
          Total Amount
        </div>
        <div style={{ fontSize: '28px', fontWeight: 700, color: '#2c3e50' }}>
          ${calculateTotal().toFixed(2)}
        </div>
      </div>

      {/* Table Section */}
      <div
        style={{
          overflowX: 'auto',
          borderRadius: '12px',
          border: '1px solid #e0e0e0',
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '600px'
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid #e0e0e0'
              }}
            >
              <th
                style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#555',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Date
              </th>
              <th
                style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#555',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Description
              </th>
              <th
                style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#555',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Merchant
              </th>
              <th
                style={{
                  padding: '14px 16px',
                  textAlign: 'right',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#555',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Amount
              </th>
              <th
                style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#555',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Category
              </th>
              <th
                style={{
                  padding: '14px 16px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#555',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Source
              </th>
              <th
                style={{
                  padding: '14px 16px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#555',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  width: '180px'
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction, index) => (
              <tr
                key={transaction.id}
                style={{
                  borderBottom:
                    index < filteredTransactions.length - 1
                      ? '1px solid #f0f0f0'
                      : 'none',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = '#f8f9fa')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = 'transparent')
                }
              >
                <td
                  style={{
                    padding: '16px',
                    fontSize: '14px',
                    color: '#555',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {new Date(transaction.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </td>
                <td
                  style={{
                    padding: '16px',
                    fontSize: '14px',
                    color: '#2c3e50',
                    fontWeight: 500,
                    maxWidth: '250px'
                  }}
                >
                  {transaction.description}
                </td>
                <td
                  style={{
                    padding: '16px',
                    fontSize: '14px',
                    color: '#666'
                  }}
                >
                  {transaction.merchantName || transaction.description}
                </td>
                <td
                  style={{
                    padding: '16px',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#2c3e50',
                    textAlign: 'right',
                    whiteSpace: 'nowrap'
                  }}
                >
                  ${transaction.amount.toFixed(2)}
                </td>
                <td style={{ padding: '16px' }}>
                  <div>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#2c3e50'
                      }}
                    >
                      {transaction.category}
                    </span>
                    {transaction.plaidCategory && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#999',
                          marginTop: '4px'
                        }}
                      >
                        {transaction.plaidCategory}
                      </div>
                    )}
                  </div>
                </td>
                <td
                  style={{
                    padding: '16px',
                    textAlign: 'center'
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor:
                        transaction.source === 'PLAID' ? '#e3f2fd' : '#f5f5f5',
                      color: transaction.source === 'PLAID' ? '#1976d2' : '#666'
                    }}
                  >
                    {transaction.source === 'PLAID' ? '🏦 Plaid' : '✏️ Manual'}
                  </span>
                </td>
                <td
                  style={{
                    padding: '16px',
                    textAlign: 'center'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    {transaction.source !== 'PLAID' && (
                      <button
                        onClick={() => onEdit(transaction)}
                        style={{
                          padding: '7px 14px',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#45a049'
                          e.currentTarget.style.transform = 'translateY(-1px)'
                          e.currentTarget.style.boxShadow =
                            '0 2px 5px rgba(0,0,0,0.15)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#4CAF50'
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow =
                            '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      style={{
                        padding: '7px 14px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#da190b'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                        e.currentTarget.style.boxShadow =
                          '0 2px 5px rgba(0,0,0,0.15)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f44336'
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow =
                          '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State for Filtered Results */}
      {filteredTransactions.length === 0 && transactions.length > 0 && (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#999',
            fontSize: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            marginTop: '20px'
          }}
        >
          No transactions match the selected filters.
        </div>
      )}
    </div>
  )
}
