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

interface BudgetSummaryProps {
  refreshTrigger?: number
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({
  refreshTrigger = 0
}) => {
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
      // If no budget exists, show a message instead of an error
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
      throw err // Let BudgetForm handle the error display
    }
  }

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading budget status...</div>
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>{error}</div>
  }

  if (budgetStatuses.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        No budget set. Create a budget to start tracking your spending!
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {budgetStatuses.map((budgetStatus) => {
          // Determine if warning color should be displayed (spending exceeds 80%)
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
              style={{
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9',
                flex: '1 1 320px',
                minWidth: '320px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '4px'
                }}
              >
                <h2 style={{ marginTop: 0, marginBottom: 0 }}>
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
                  color: '#666',
                  fontSize: '14px'
                }}
              >
                Period: {budgetStatus.period}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '32px',
                  flexWrap: 'wrap'
                }}
              >
                {/* Donut chart */}
                <div style={{ width: 220, height: 220, flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        <Cell fill={spentColor} />
                        <Cell fill="#e0e0e0" />
                      </Pie>
                      <Tooltip
                        formatter={(value: number | undefined) =>
                          value !== undefined ? `$${value.toFixed(2)}` : ''
                        }
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Stats */}
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#666',
                        marginBottom: '2px'
                      }}
                    >
                      Budget
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold' }}>
                      ${budgetStatus.amount.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#666',
                        marginBottom: '2px'
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
                  <div style={{ marginBottom: '12px' }}>
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#666',
                        marginBottom: '2px'
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

              {/* Warning message when exceeding 80% */}
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
                    marginTop: '16px'
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
                  <span style={{ marginLeft: '10px' }}>
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

      {/* Edit Modal */}
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
            zIndex: 1000
          }}
          onClick={handleCloseEdit}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '90%',
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
              <h2 style={{ margin: 0 }}>Edit Budget</h2>
              <button
                onClick={handleCloseEdit}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
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
