import React, { useState, useEffect } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { BudgetStatus, BudgetRequest } from '../types/budget'
import { budgetService } from '../services/budgetService'
import { BudgetForm } from './BudgetForm'
import { useTheme } from '../contexts/ThemeContext'

interface BudgetSummaryProps {
  refreshTrigger?: number
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({
  refreshTrigger = 0
}) => {
  const { isDarkMode } = useTheme()
  const [budgetStatuses, setBudgetStatuses] = useState<BudgetStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null)
  const [editingBudget, setEditingBudget] = useState<BudgetStatus | null>(null)

  useEffect(() => {
    fetchBudgetStatus()
  }, [refreshTrigger])

  const fetchBudgetStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      const statuses = await budgetService.getCurrentBudgetStatus()
      setBudgetStatuses(statuses)
    } catch (err: any) {
      if (err.response?.status === 404) {
        setBudgetStatuses([])
        setError(null)
      } else {
        setError('Failed to load budget status. Please try again.')
        console.error('Error fetching budget status:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (budgetStatus: BudgetStatus) => {
    setEditingBudgetId(budgetStatus.budgetId)
    setEditingBudget(budgetStatus)
  }

  const handleCloseEdit = () => {
    setEditingBudgetId(null)
    setEditingBudget(null)
  }

  const handleDeleteClick = async (budgetId: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this budget? This action cannot be undone.'
      )
    ) {
      try {
        await budgetService.deleteBudget(budgetId)
        await fetchBudgetStatus()
      } catch (err: any) {
        console.error('Error deleting budget:', err)
        setError('Failed to delete budget. Please try again.')
      }
    }
  }

  const handleUpdateBudget = async (budgetRequest: BudgetRequest) => {
    if (!editingBudgetId) return

    try {
      await budgetService.updateBudget(editingBudgetId, budgetRequest.amount)
      await fetchBudgetStatus()
      handleCloseEdit()
    } catch (err: any) {
      throw err
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', color: isDarkMode ? '#e0e0e0' : '#333' }}>
        Loading budget status...
      </div>
    )
  }

  if (error) {
    return <div style={{ padding: '20px', color: '#f44336' }}>{error}</div>
  }

  if (budgetStatuses.length === 0) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          color: isDarkMode ? '#b0b0b0' : '#666'
        }}
      >
        No budget set. Create a budget to start tracking your spending!
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {budgetStatuses.map((budgetStatus) => {
          const isWarning = budgetStatus.percentageUsed >= 80
          const remainingColor = isWarning ? '#ff9800' : '#4CAF50'

          const spentColor =
            budgetStatus.percentageUsed >= 100
              ? '#f44336'
              : budgetStatus.percentageUsed >= 80
                ? '#ff9800'
                : '#4CAF50'

          const chartData = [
            { name: 'Spent', value: budgetStatus.spent },
            { name: 'Remaining', value: Math.max(budgetStatus.remaining, 0) }
          ]

          return (
            <div
              key={budgetStatus.budgetId}
              className="budget-card"
              style={{
                padding: '20px',
                border: `1px solid ${isDarkMode ? '#2c3e50' : '#ddd'}`,
                borderRadius: '8px',
                backgroundColor: isDarkMode ? '#16213e' : '#f9f9f9',
                flex: '1 1 320px',
                minWidth: '300px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}
              >
                <h2
                  style={{
                    marginTop: 0,
                    marginBottom: 0,
                    fontSize: '20px',
                    color: isDarkMode ? '#e0e0e0' : '#2c3e50'
                  }}
                >
                  {budgetStatus.category || 'General'} Budget
                </h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEditClick(budgetStatus)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#2c3e50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1a252f'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#2c3e50'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(budgetStatus.budgetId)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#da190b'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f44336'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div
                style={{
                  marginBottom: '16px',
                  color: isDarkMode ? '#b0b0b0' : '#666',
                  fontSize: '14px'
                }}
              >
                Period: {budgetStatus.period}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '24px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ width: 200, height: 200, flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        <Cell fill={spentColor} />
                        <Cell fill="#e0e0e0" />
                      </Pie>
                      <Tooltip
                        formatter={(value: any) =>
                          typeof value === 'number'
                            ? `$${value.toFixed(2)}`
                            : ''
                        }
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ flex: 1, minWidth: '180px' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <div
                      style={{
                        fontSize: '13px',
                        color: isDarkMode ? '#b0b0b0' : '#666',
                        marginBottom: '4px'
                      }}
                    >
                      Budget
                    </div>
                    <div
                      style={{
                        fontSize: '22px',
                        fontWeight: 'bold',
                        color: isDarkMode ? '#e0e0e0' : '#2c3e50'
                      }}
                    >
                      ${budgetStatus.amount.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <div
                      style={{
                        fontSize: '13px',
                        color: isDarkMode ? '#b0b0b0' : '#666',
                        marginBottom: '4px'
                      }}
                    >
                      Spent
                    </div>
                    <div
                      style={{
                        fontSize: '22px',
                        fontWeight: 'bold',
                        color: spentColor
                      }}
                    >
                      ${budgetStatus.spent.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <div
                      style={{
                        fontSize: '13px',
                        color: isDarkMode ? '#b0b0b0' : '#666',
                        marginBottom: '4px'
                      }}
                    >
                      Remaining
                    </div>
                    <div
                      style={{
                        fontSize: '22px',
                        fontWeight: 'bold',
                        color: remainingColor
                      }}
                    >
                      ${budgetStatus.remaining.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', color: '#888' }}>
                    {budgetStatus.percentageUsed.toFixed(1)}% used
                  </div>
                </div>
              </div>

              {isWarning && (
                <div
                  style={{
                    padding: '10px',
                    backgroundColor:
                      budgetStatus.percentageUsed >= 100
                        ? '#ffebee'
                        : '#fff3e0',
                    border: `1px solid ${budgetStatus.percentageUsed >= 100 ? '#f44336' : '#ff9800'}`,
                    borderRadius: '4px',
                    marginTop: '16px',
                    fontSize: '13px'
                  }}
                >
                  <span
                    style={{
                      fontWeight: 'bold',
                      color:
                        budgetStatus.percentageUsed >= 100
                          ? '#f44336'
                          : '#ff9800'
                    }}
                  >
                    {budgetStatus.percentageUsed >= 100
                      ? '⚠️ Budget Exceeded!'
                      : '⚠️ Warning!'}
                  </span>
                  <span style={{ marginLeft: '8px' }}>
                    {budgetStatus.percentageUsed >= 100
                      ? 'You have exceeded your budget.'
                      : 'You have used more than 80% of your budget.'}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {editingBudgetId && editingBudget && (
        <div
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
            zIndex: 1000,
            padding: '16px'
          }}
          onClick={handleCloseEdit}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: isDarkMode ? '#16213e' : 'white',
              padding: '24px',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}
            >
              <h2
                style={{ margin: 0, color: isDarkMode ? '#e0e0e0' : '#2c3e50' }}
              >
                Edit Budget
              </h2>
              <button
                onClick={handleCloseEdit}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: isDarkMode ? '#b0b0b0' : '#666',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
            <BudgetForm
              onSubmit={handleUpdateBudget}
              initialData={{
                amount: editingBudget.amount,
                period: editingBudget.period,
                category: editingBudget.category
              }}
              submitLabel="Update Budget"
            />
          </div>
        </div>
      )}
    </>
  )
}
