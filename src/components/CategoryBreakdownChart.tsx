import React, { useState, useEffect } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { transactionService } from '../services/transactionService'
import { useTheme } from '../contexts/ThemeContext'

interface CategoryBreakdownChartProps {
  refreshTrigger?: number
}

const COLORS = [
  '#2196F3',
  '#4CAF50',
  '#FF9800',
  '#F44336',
  '#9C27B0',
  '#00BCD4',
  '#FFC107'
]

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({
  refreshTrigger = 0
}) => {
  const { isDarkMode } = useTheme()
  const [categoryData, setCategoryData] = useState<
    Array<{ category: string; total: number }>
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategoryData()
  }, [refreshTrigger])

  const fetchCategoryData = async () => {
    try {
      setLoading(true)
      const data = await transactionService.getTotalsByCategory()
      setCategoryData(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching category data:', err)
      setCategoryData([])
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
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #e0e0e0'
        }}
      >
        Loading chart...
      </div>
    )
  }

  if (categoryData.length === 0) {
    return null
  }

  const total = categoryData.reduce((sum, item) => sum + item.total, 0)

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
          fontSize: '20px',
          fontWeight: 600,
          color: isDarkMode ? '#e0e0e0' : '#2c3e50'
        }}
      >
        Spending by Category
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ category, percent }) =>
              `${category}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey="total"
          >
            {categoryData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
        </PieChart>
      </ResponsiveContainer>

      <div
        style={{
          marginTop: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px'
        }}
      >
        {categoryData.map((item, index) => (
          <div
            key={item.category}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              backgroundColor: isDarkMode ? '#0f3460' : '#f8f9fa',
              borderRadius: '6px'
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: COLORS[index % COLORS.length],
                borderRadius: '2px'
              }}
            ></div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: '12px',
                  color: isDarkMode ? '#b0b0b0' : '#666',
                  fontWeight: 500
                }}
              >
                {item.category}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: isDarkMode ? '#e0e0e0' : '#2c3e50'
                }}
              >
                ${item.total.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: isDarkMode ? '#0f3460' : '#f0f4ff',
          borderRadius: '8px',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            fontSize: '12px',
            color: isDarkMode ? '#b0b0b0' : '#666',
            marginBottom: '4px'
          }}
        >
          Total Spending
        </div>
        <div
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: isDarkMode ? '#e0e0e0' : '#2c3e50'
          }}
        >
          ${total.toFixed(2)}
        </div>
      </div>
    </div>
  )
}
