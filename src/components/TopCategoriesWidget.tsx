import React, { useState, useEffect } from 'react'
import { transactionService } from '../services/transactionService'
import { useTheme } from '../contexts/ThemeContext'

interface TopCategoriesWidgetProps {
  refreshTrigger?: number
}

export const TopCategoriesWidget: React.FC<TopCategoriesWidgetProps> = ({
  refreshTrigger = 0
}) => {
  const { isDarkMode } = useTheme()
  const [categories, setCategories] = useState<
    Array<{ category: string; total: number }>
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [refreshTrigger])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await transactionService.getTotalsByCategory()
      const dataArray = Array.isArray(data) ? data : []
      const sorted = dataArray.sort((a, b) => b.total - a.total).slice(0, 5)
      setCategories(sorted)
    } catch (err) {
      console.error('Error fetching categories:', err)
      setCategories([])
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

  if (categories.length === 0) {
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
          Top Categories
        </h3>
        <p
          style={{
            color: isDarkMode ? '#b0b0b0' : '#666',
            margin: 0,
            fontSize: '14px'
          }}
        >
          No spending data yet
        </p>
      </div>
    )
  }

  const maxAmount = Math.max(...categories.map((c) => c.total))

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
        Top 5 Categories
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {categories.map((cat, index) => {
          const percentage = (cat.total / maxAmount) * 100
          return (
            <div key={cat.category}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '6px'
                }}
              >
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: isDarkMode ? '#e0e0e0' : '#2c3e50'
                  }}
                >
                  {index + 1}. {cat.category}
                </span>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: isDarkMode ? '#e0e0e0' : '#2c3e50'
                  }}
                >
                  ${cat.total.toFixed(2)}
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: isDarkMode ? '#0f3460' : '#f0f0f0',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: '#2196F3',
                    transition: 'width 0.3s ease',
                    borderRadius: '4px'
                  }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
