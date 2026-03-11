import React, { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { Transaction } from '../types/transaction'
import { transactionService } from '../services/transactionService'
import { useTheme } from '../contexts/ThemeContext'

interface SpendingTrendsChartProps {
  refreshTrigger?: number
}

export const SpendingTrendsChart: React.FC<SpendingTrendsChartProps> = ({
  refreshTrigger = 0
}) => {
  const { isDarkMode } = useTheme()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [refreshTrigger])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const data = await transactionService.getAllTransactions()
      setTransactions(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const getChartData = () => {
    const dailySpending: { [key: string]: number } = {}

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
      dailySpending[date] = (dailySpending[date] || 0) + transaction.amount
    })

    return Object.entries(dailySpending)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30) // Last 30 days
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
        Loading chart...
      </div>
    )
  }

  const chartData = getChartData()

  if (chartData.length === 0) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: isDarkMode ? '#16213e' : 'white',
          borderRadius: '12px',
          border: `1px solid ${isDarkMode ? '#2c3e50' : '#e0e0e0'}`
        }}
      >
        <p style={{ color: isDarkMode ? '#b0b0b0' : '#666', margin: 0 }}>
          No transaction data available for chart
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 600,
            color: isDarkMode ? '#e0e0e0' : '#2c3e50'
          }}
        >
          Spending Trends (Last 30 Days)
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setChartType('line')}
            style={{
              padding: '8px 16px',
              backgroundColor:
                chartType === 'line'
                  ? isDarkMode
                    ? '#2196F3'
                    : '#2c3e50'
                  : isDarkMode
                    ? '#0f3460'
                    : 'white',
              color:
                chartType === 'line'
                  ? 'white'
                  : isDarkMode
                    ? '#b0b0b0'
                    : '#666',
              border: `1.5px solid ${isDarkMode ? '#2c3e50' : '#e0e0e0'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
          >
            Line
          </button>
          <button
            onClick={() => setChartType('bar')}
            style={{
              padding: '8px 16px',
              backgroundColor:
                chartType === 'bar'
                  ? isDarkMode
                    ? '#2196F3'
                    : '#2c3e50'
                  : isDarkMode
                    ? '#0f3460'
                    : 'white',
              color:
                chartType === 'bar' ? 'white' : isDarkMode ? '#b0b0b0' : '#666',
              border: `1.5px solid ${isDarkMode ? '#2c3e50' : '#e0e0e0'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
          >
            Bar
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        {chartType === 'line' ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#666" />
            <YAxis tick={{ fontSize: 12 }} stroke="#666" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              formatter={(value: number) => `$${value.toFixed(2)}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#2196F3"
              strokeWidth={2}
              dot={{ fill: '#2196F3', r: 4 }}
              name="Spending"
            />
          </LineChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#666" />
            <YAxis tick={{ fontSize: 12 }} stroke="#666" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              formatter={(value: number) => `$${value.toFixed(2)}`}
            />
            <Legend />
            <Bar dataKey="amount" fill="#2196F3" name="Spending" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
