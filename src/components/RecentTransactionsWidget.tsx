import React, { useState, useEffect } from 'react'
import { Transaction } from '../types/transaction'
import { transactionService } from '../services/transactionService'
import { useTheme } from '../contexts/ThemeContext'

interface RecentTransactionsWidgetProps {
  refreshTrigger?: number
}

export const RecentTransactionsWidget: React.FC<
  RecentTransactionsWidgetProps
> = ({ refreshTrigger = 0 }) => {
  const { isDarkMode } = useTheme()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [refreshTrigger])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const data = await transactionService.getAllTransactions()
      const dataArray = Array.isArray(data) ? data : []
      const sorted = dataArray
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
      setTransactions(sorted)
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: isDarkMode ? '#16213e' : 'white',
          borderRadius: '12px',
          border: `1px solid ${isDarkMode ? '#2c3e50' : '#e0e0e0'}`,
          color: isDarkMode ? '#e0e0e0' : '#333'
        }}
      >
        Loading...
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          backgroundColor: isDarkMode ? '#16213e' : 'white',
          borderRadius: '12px',
          border: `1px solid ${isDarkMode ? '#2c3e50' : '#e0e0e0'}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}
      >
        <h3
          style={{
            margin: '0 0 12px 0',
            fontSize: '18px',
            fontWeight: 600,
            color: isDarkMode ? '#e0e0e0' : '#2c3e50'
          }}
        >
          Recent Transactions
        </h3>
        <p
          style={{
            color: isDarkMode ? '#b0b0b0' : '#666',
            margin: 0,
            fontSize: '14px'
          }}
        >
          No transactions yet
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        backgroundColor: isDarkMode ? '#16213e' : 'white',
        padding: '24px',
        borderRadius: '12px',
        border: `1px solid ${isDarkMode ? '#2c3e50' : '#e0e0e0'}`,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}
    >
      <h3
        style={{
          margin: '0 0 20px 0',
          fontSize: '18px',
          fontWeight: 600,
          color: isDarkMode ? '#e0e0e0' : '#2c3e50'
        }}
      >
        Recent Transactions
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: isDarkMode ? '#0f3460' : '#f8f9fa',
              borderRadius: '8px',
              gap: '12px'
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: isDarkMode ? '#e0e0e0' : '#2c3e50',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {transaction.description}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: isDarkMode ? '#b0b0b0' : '#666',
                  marginTop: '4px',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center'
                }}
              >
                <span>
                  {new Date(transaction.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                <span>•</span>
                <span>{transaction.category}</span>
              </div>
            </div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: isDarkMode ? '#e0e0e0' : '#2c3e50',
                whiteSpace: 'nowrap'
              }}
            >
              ${transaction.amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
