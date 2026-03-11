import React, { useState, useEffect } from 'react'
import { Transaction, TransactionSource, Category } from '../types/transaction'
import { transactionService } from '../services/transactionService'
import { useTheme } from '../contexts/ThemeContext'
import { ConfirmDialog } from './ConfirmDialog'

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
  const { isDarkMode } = useTheme()
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
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    transactionId: string | null
    description: string
  }>({
    isOpen: false,
    transactionId: null,
    description: ''
  })

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

  const handleDelete = async (id: string, description: string) => {
    setDeleteConfirm({
      isOpen: true,
      transactionId: id,
      description
    })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.transactionId) return

    try {
      onDelete(deleteConfirm.transactionId)
      await fetchTransactions()
      setDeleteConfirm({ isOpen: false, transactionId: null, description: '' })
    } catch (err) {
      console.error('Error deleting transaction:', err)
      setDeleteConfirm({ isOpen: false, transactionId: null, description: '' })
    }
  }

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, transactionId: null, description: '' })
  }

  if (loading) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          color: isDarkMode ? '#b0b0b0' : '#666',
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
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h2
            style={{
              margin: '0 0 8px 0',
              fontSize: '22px',
              fontWeight: 600,
              color: isDarkMode ? '#e0e0e0' : '#2c3e50'
            }}
          >
            Transactions
          </h2>
          <div
            style={{
              fontSize: '14px',
              color: isDarkMode ? '#b0b0b0' : '#666',
              fontWeight: 500
            }}
          >
            {filteredTransactions.length} transaction
            {filteredTransactions.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div
          className="filter-controls"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flex: '1 1 auto',
              minWidth: '200px'
            }}
          >
            <label
              htmlFor="categoryFilter"
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: isDarkMode ? '#b0b0b0' : '#555',
                whiteSpace: 'nowrap'
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
                padding: '8px 28px 8px 10px',
                border: `1.5px solid ${isDarkMode ? '#2c3e50' : '#e0e0e0'}`,
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                backgroundColor: isDarkMode ? '#0f3460' : 'white',
                color: isDarkMode ? '#e0e0e0' : '#333',
                cursor: 'pointer',
                outline: 'none',
                transition: 'border-color 0.2s',
                flex: 1
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

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flex: '1 1 auto',
              minWidth: '180px'
            }}
          >
            <label
              htmlFor="sourceFilter"
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: isDarkMode ? '#b0b0b0' : '#555',
                whiteSpace: 'nowrap'
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
                padding: '8px 28px 8px 10px',
                border: `1.5px solid ${isDarkMode ? '#2c3e50' : '#e0e0e0'}`,
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                backgroundColor: isDarkMode ? '#0f3460' : 'white',
                color: isDarkMode ? '#e0e0e0' : '#333',
                cursor: 'pointer',
                outline: 'none',
                transition: 'border-color 0.2s',
                flex: 1
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
          marginBottom: '20px',
          padding: '14px 16px',
          backgroundColor: isDarkMode ? '#16213e' : '#f8f9fa',
          borderRadius: '10px',
          border: `1px solid ${isDarkMode ? '#2c3e50' : '#e9ecef'}`
        }}
      >
        <div
          style={{
            fontSize: '12px',
            color: isDarkMode ? '#b0b0b0' : '#666',
            marginBottom: '4px',
            fontWeight: 500
          }}
        >
          Total Amount
        </div>
        <div
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: isDarkMode ? '#e0e0e0' : '#2c3e50'
          }}
        >
          ${calculateTotal().toFixed(2)}
        </div>
      </div>

      {/* Table Section */}
      <div
        className="table-container"
        style={{
          overflowX: 'auto',
          borderRadius: '12px',
          border: `1px solid ${isDarkMode ? '#2c3e50' : '#e0e0e0'}`,
          backgroundColor: isDarkMode ? '#16213e' : 'white',
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
                backgroundColor: isDarkMode ? '#0f3460' : '#f8f9fa',
                borderBottom: `2px solid ${isDarkMode ? '#2c3e50' : '#e0e0e0'}`
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
                  (e.currentTarget.style.backgroundColor = isDarkMode
                    ? '#0f3460'
                    : '#f8f9fa')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = 'transparent')
                }
              >
                <td
                  style={{
                    padding: '16px',
                    fontSize: '14px',
                    color: isDarkMode ? '#b0b0b0' : '#555',
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
                    color: isDarkMode ? '#e0e0e0' : '#2c3e50',
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
                    color: isDarkMode ? '#e0e0e0' : '#666'
                  }}
                >
                  {transaction.merchantName || transaction.description}
                </td>
                <td
                  style={{
                    padding: '16px',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: isDarkMode ? '#e0e0e0' : '#2c3e50',
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
                        color: isDarkMode ? '#e0e0e0' : '#2c3e50'
                      }}
                    >
                      {transaction.category}
                    </span>
                    {transaction.plaidCategory && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: isDarkMode ? '#999' : '#999',
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
                      color:
                        transaction.source === 'PLAID'
                          ? '#1976d2'
                          : isDarkMode
                            ? '#b0b0b0'
                            : '#666'
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
                      onClick={() =>
                        handleDelete(transaction.id, transaction.description)
                      }
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Transaction"
        message={`Are you sure you want to delete "${deleteConfirm.description}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isDanger={true}
      />
    </div>
  )
}
