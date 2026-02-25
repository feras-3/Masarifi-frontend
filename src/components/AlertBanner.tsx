import React, { useState, useEffect } from 'react';
import { Alert } from '../types/alert';
import { alertService } from '../services/alertService';

interface AlertBannerProps {
  refreshTrigger?: number;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ refreshTrigger = 0 }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, [refreshTrigger]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await alertService.getAlerts();
      // Filter to show only non-dismissed alerts
      const activeAlerts = response.alerts.filter(alert => !alert.dismissed);
      setAlerts(activeAlerts);
      setUnreadCount(response.unreadCount);
    } catch (err: any) {
      setError('Failed to load alerts. Please try again.');
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (alertId: string) => {
    try {
      await alertService.dismissAlert(alertId);
      // Remove the dismissed alert from the display
      setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
      // Update unread count
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (err: any) {
      console.error('Error dismissing alert:', err);
      setError('Failed to dismiss alert. Please try again.');
    }
  };

  const getAlertStyles = (type: 'WARNING' | 'CRITICAL') => {
    if (type === 'CRITICAL') {
      return {
        backgroundColor: '#ffebee',
        borderColor: '#f44336',
        iconColor: '#f44336',
        icon: '🚨'
      };
    } else {
      return {
        backgroundColor: '#fff3e0',
        borderColor: '#ff9800',
        iconColor: '#ff9800',
        icon: '⚠️'
      };
    }
  };

  if (loading) {
    return null; // Don't show loading state for alerts
  }

  if (error) {
    return (
      <div style={{ padding: '10px', color: 'red', fontSize: '14px' }}>
        {error}
      </div>
    );
  }

  // Don't render anything if there are no active alerts
  if (alerts.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Unread count badge */}
      {unreadCount > 0 && (
        <div
          style={{
            display: 'inline-block',
            padding: '5px 12px',
            backgroundColor: '#f44336',
            color: 'white',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '10px'
          }}
        >
          {unreadCount} {unreadCount === 1 ? 'Alert' : 'Alerts'}
        </div>
      )}

      {/* Alert list */}
      {alerts.map(alert => {
        const styles = getAlertStyles(alert.type);
        return (
          <div
            key={alert.id}
            style={{
              padding: '15px',
              backgroundColor: styles.backgroundColor,
              border: `2px solid ${styles.borderColor}`,
              borderRadius: '8px',
              marginBottom: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px', marginRight: '10px' }}>
                  {styles.icon}
                </span>
                <span
                  style={{
                    fontWeight: 'bold',
                    fontSize: '16px',
                    color: styles.iconColor
                  }}
                >
                  {alert.type === 'CRITICAL' ? 'Budget Exceeded!' : 'Budget Warning!'}
                </span>
              </div>

              <div style={{ marginLeft: '34px', fontSize: '14px', lineHeight: '1.5' }}>
                <p style={{ margin: '5px 0' }}>
                  <strong>Budget:</strong> ${alert.budgetAmount.toFixed(2)}
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Current Spending:</strong> ${alert.currentSpending.toFixed(2)}
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Percentage:</strong> {alert.percentageExceeded.toFixed(1)}%
                </p>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  {alert.type === 'CRITICAL'
                    ? 'You have exceeded your budget limit. Consider reviewing your expenses.'
                    : 'You have reached 80% of your budget. Monitor your spending carefully.'}
                </p>
              </div>
            </div>

            {/* Dismiss button */}
            <button
              onClick={() => handleDismiss(alert.id)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                border: `1px solid ${styles.borderColor}`,
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                color: styles.iconColor,
                marginLeft: '15px',
                flexShrink: 0
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = styles.backgroundColor;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              Dismiss
            </button>
          </div>
        );
      })}
    </div>
  );
};
