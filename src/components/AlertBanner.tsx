import React, { useState, useEffect } from 'react'
import { Alert } from '../types/alert'
import { alertService } from '../services/alertService'

interface AlertBannerProps {
  refreshTrigger?: number
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  refreshTrigger = 0
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
  }, [refreshTrigger])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const response = await alertService.getAlerts()
      const activeAlerts = response.filter((alert) => !alert.dismissed)
      setAlerts(activeAlerts)
      setUnreadCount(activeAlerts.length)
    } catch (err: any) {
      console.error('Error fetching alerts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = async (alertId: string) => {
    try {
      await alertService.dismissAlert(alertId)
      setAlerts((prevAlerts) =>
        prevAlerts.filter((alert) => alert.id !== alertId)
      )
      setUnreadCount((prevCount) => Math.max(0, prevCount - 1))
    } catch (err: any) {
      console.error('Error dismissing alert:', err)
    }
  }

  const getAlertStyles = (type: string) => {
    if (
      type === 'BUDGET_EXCEEDED' ||
      type === 'BUDGET_100_PERCENT' ||
      type === 'CRITICAL'
    ) {
      return {
        backgroundColor: '#ffebee',
        borderColor: '#f44336',
        iconColor: '#f44336',
        icon: '🚨'
      }
    } else {
      return {
        backgroundColor: '#fff3e0',
        borderColor: '#ff9800',
        iconColor: '#ff9800',
        icon: '⚠️'
      }
    }
  }

  if (loading) {
    return null
  }

  if (alerts.length === 0) {
    return null
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      {unreadCount > 0 && (
        <div
          style={{
            display: 'inline-block',
            padding: '6px 14px',
            backgroundColor: '#f44336',
            color: 'white',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '12px',
            boxShadow: '0 2px 4px rgba(244, 67, 54, 0.3)'
          }}
        >
          {unreadCount} {unreadCount === 1 ? 'Alert' : 'Alerts'}
        </div>
      )}

      {alerts.map((alert) => {
        const styles = getAlertStyles(alert.type)
        return (
          <div
            key={alert.id}
            style={{
              padding: '20px',
              backgroundColor: styles.backgroundColor,
              border: `2px solid ${styles.borderColor}`,
              borderRadius: '12px',
              marginBottom: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s ease'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px',
                flexWrap: 'wrap'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flex: 1,
                  minWidth: '200px'
                }}
              >
                <span style={{ fontSize: '28px', lineHeight: 1 }}>
                  {styles.icon}
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '18px',
                    color: styles.iconColor,
                    letterSpacing: '-0.3px'
                  }}
                >
                  {alert.type === 'BUDGET_EXCEEDED' ||
                  alert.type === 'BUDGET_100_PERCENT'
                    ? 'Budget Exceeded!'
                    : 'Budget Warning!'}
                </span>
              </div>

              <button
                onClick={() => handleDismiss(alert.id)}
                aria-label="Dismiss alert"
                style={{
                  padding: '8px 18px',
                  backgroundColor: 'white',
                  border: `1.5px solid ${styles.borderColor}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: styles.iconColor,
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                  minWidth: '44px',
                  minHeight: '44px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = styles.iconColor
                  e.currentTarget.style.color = 'white'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white'
                  e.currentTarget.style.color = styles.iconColor
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Dismiss
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                fontSize: '14px',
                lineHeight: '1.6'
              }}
            >
              <div>
                <div
                  style={{
                    color: '#666',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px'
                  }}
                >
                  Budget
                </div>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#2c3e50'
                  }}
                >
                  ${alert.budgetAmount.toFixed(2)}
                </div>
              </div>
              <div>
                <div
                  style={{
                    color: '#666',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px'
                  }}
                >
                  Current Spending
                </div>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: styles.iconColor
                  }}
                >
                  ${alert.currentSpending.toFixed(2)}
                </div>
              </div>
              <div>
                <div
                  style={{
                    color: '#666',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px'
                  }}
                >
                  Percentage
                </div>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: styles.iconColor
                  }}
                >
                  {alert.percentageExceeded.toFixed(1)}%
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(255,255,255,0.7)',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#555',
                lineHeight: '1.5'
              }}
            >
              {alert.type === 'BUDGET_EXCEEDED' ||
              alert.type === 'BUDGET_100_PERCENT'
                ? '💡 You have exceeded your budget limit. Consider reviewing your expenses and adjusting your spending habits.'
                : '💡 You have reached 80% of your budget. Monitor your spending carefully to stay within limits.'}
            </div>
          </div>
        )
      })}
    </div>
  )
}
