import React, { useState, useEffect } from 'react'
import { budgetService } from '../services/budgetService'
import { BudgetStatus } from '../types/budget'
import { useTheme } from '../contexts/ThemeContext'

interface BudgetInsightsWidgetProps {
  refreshTrigger?: number
}

export const BudgetInsightsWidget: React.FC<BudgetInsightsWidgetProps> = ({
  refreshTrigger = 0
}) => {
  const { isDarkMode } = useTheme()
  const [budgets, setBudgets] = useState<BudgetStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBudgets()
  }, [refreshTrigger])

  const fetchBudgets = async () => {
    try {
      setLoading(true)
      const data = await budgetService.getCurrentBudgetStatus()
      setBudgets(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching budgets:', err)
      setBudgets([])
    } finally {
      setLoading(false)
    }
  }

  const getDaysUntilReset = () => {
    const now = new Date()
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const daysLeft = Math.ceil(
      (lastDay.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysLeft
  }

  const getSpendingVelocity = (budget: BudgetStatus) => {
    const daysInMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    ).getDate()
    const currentDay = new Date().getDate()
    const daysElapsed = currentDay
    const dailyAverage = budget.spent / daysElapsed
    const projectedSpending = dailyAverage * daysInMonth

    return {
      dailyAverage,
      projectedSpending,
      isOverBudget: projectedSpending > budget.amount
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

  if (budgets.length === 0) {
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
          Budget Insights
        </h3>
        <p
          style={{
            color: isDarkMode ? '#b0b0b0' : '#666',
            margin: 0,
            fontSize: '14px'
          }}
        >
          Set a budget to see insights
        </p>
      </div>
    )
  }

  const daysLeft = getDaysUntilReset()
  const mainBudget = budgets[0]
  const velocity = getSpendingVelocity(mainBudget)

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
        Budget Insights
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Days Until Reset */}
        <div
          style={{
            padding: '16px',
            backgroundColor: isDarkMode ? '#0f3460' : '#f0f4ff',
            borderRadius: '10px',
            border: `1px solid ${isDarkMode ? '#16213e' : '#d0e0ff'}`
          }}
        >
          <div
            style={{
              fontSize: '12px',
              color: isDarkMode ? '#b0b0b0' : '#666',
              marginBottom: '6px',
              fontWeight: 500
            }}
          >
            Days Until Budget Reset
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span
              style={{ fontSize: '32px', fontWeight: 700, color: '#2196F3' }}
            >
              {daysLeft}
            </span>
            <span
              style={{
                fontSize: '14px',
                color: isDarkMode ? '#b0b0b0' : '#666'
              }}
            >
              days left
            </span>
          </div>
        </div>

        {/* Spending Velocity */}
        <div
          style={{
            padding: '16px',
            backgroundColor: velocity.isOverBudget
              ? isDarkMode
                ? '#3d2a1f'
                : '#fff3e0'
              : isDarkMode
                ? '#1f3d2a'
                : '#f0fff4',
            borderRadius: '10px',
            border: `1px solid ${velocity.isOverBudget ? (isDarkMode ? '#5d3a2f' : '#ffe0b2') : isDarkMode ? '#2f5d3a' : '#c3e6cb'}`
          }}
        >
          <div
            style={{
              fontSize: '12px',
              color: isDarkMode ? '#b0b0b0' : '#666',
              marginBottom: '6px',
              fontWeight: 500
            }}
          >
            Daily Spending Rate
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '8px',
              marginBottom: '12px'
            }}
          >
            <span
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: isDarkMode ? '#e0e0e0' : '#2c3e50'
              }}
            >
              ${velocity.dailyAverage.toFixed(2)}
            </span>
            <span
              style={{
                fontSize: '14px',
                color: isDarkMode ? '#b0b0b0' : '#666'
              }}
            >
              per day
            </span>
          </div>

          <div
            style={{
              padding: '12px',
              backgroundColor: isDarkMode ? '#1a1a2e' : 'white',
              borderRadius: '6px',
              marginTop: '8px'
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: isDarkMode ? '#b0b0b0' : '#666',
                marginBottom: '4px'
              }}
            >
              Projected Month-End
            </div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: velocity.isOverBudget ? '#ff9800' : '#4CAF50'
              }}
            >
              ${velocity.projectedSpending.toFixed(2)}
            </div>
            {velocity.isOverBudget && (
              <div
                style={{
                  fontSize: '12px',
                  color: '#ff9800',
                  marginTop: '4px',
                  fontWeight: 500
                }}
              >
                ⚠️ Projected to exceed budget
              </div>
            )}
          </div>
        </div>

        {/* Budget Progress */}
        <div
          style={{
            padding: '16px',
            backgroundColor: isDarkMode ? '#0f3460' : '#f8f9fa',
            borderRadius: '10px'
          }}
        >
          <div
            style={{
              fontSize: '12px',
              color: isDarkMode ? '#b0b0b0' : '#666',
              marginBottom: '8px',
              fontWeight: 500
            }}
          >
            {mainBudget.category || 'Overall'} Budget Progress
          </div>
          <div
            style={{
              width: '100%',
              height: '10px',
              backgroundColor: isDarkMode ? '#1a1a2e' : '#e0e0e0',
              borderRadius: '5px',
              overflow: 'hidden',
              marginBottom: '8px'
            }}
          >
            <div
              style={{
                width: `${Math.min(mainBudget.percentageUsed, 100)}%`,
                height: '100%',
                backgroundColor:
                  mainBudget.percentageUsed >= 100
                    ? '#f44336'
                    : mainBudget.percentageUsed >= 80
                      ? '#ff9800'
                      : '#4CAF50',
                transition: 'width 0.3s ease'
              }}
            ></div>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '13px'
            }}
          >
            <span style={{ color: isDarkMode ? '#b0b0b0' : '#666' }}>
              ${mainBudget.spent.toFixed(2)} spent
            </span>
            <span
              style={{
                fontWeight: 600,
                color: isDarkMode ? '#e0e0e0' : '#2c3e50'
              }}
            >
              {mainBudget.percentageUsed.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
