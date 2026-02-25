import React, { useState, useEffect } from 'react';
import { BudgetStatus } from '../types/budget';
import { budgetService } from '../services/budgetService';

interface BudgetSummaryProps {
  refreshTrigger?: number;
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({ refreshTrigger = 0 }) => {
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBudgetStatus();
  }, [refreshTrigger]);

  const fetchBudgetStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const status = await budgetService.getCurrentBudgetStatus();
      setBudgetStatus(status);
    } catch (err: any) {
      // If no budget exists, show a message instead of an error
      if (err.response?.status === 404) {
        setBudgetStatus(null);
        setError(null);
      } else {
        setError('Failed to load budget status. Please try again.');
        console.error('Error fetching budget status:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading budget status...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
  }

  if (!budgetStatus) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        No budget set. Create a budget to start tracking your spending!
      </div>
    );
  }

  // Determine if warning color should be displayed (spending exceeds 80%)
  const isWarning = budgetStatus.percentageUsed >= 80;
  const remainingColor = isWarning ? '#ff9800' : '#4CAF50';

  return (
    <div
      style={{
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        maxWidth: '600px',
        margin: '20px 0'
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Budget Summary</h2>

      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontWeight: 'bold' }}>Period:</span>
          <span>{budgetStatus.period}</span>
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontWeight: 'bold' }}>Budget Amount:</span>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
            ${budgetStatus.amount.toFixed(2)}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontWeight: 'bold' }}>Spent:</span>
          <span style={{ fontSize: '18px', color: '#f44336' }}>
            ${budgetStatus.spent.toFixed(2)}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontWeight: 'bold' }}>Remaining Balance:</span>
          <span
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: remainingColor
            }}
          >
            ${budgetStatus.remaining.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontWeight: 'bold' }}>Usage:</span>
          <span style={{ fontWeight: 'bold' }}>
            {budgetStatus.percentageUsed.toFixed(1)}%
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: '20px',
            backgroundColor: '#e0e0e0',
            borderRadius: '10px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: `${Math.min(budgetStatus.percentageUsed, 100)}%`,
              height: '100%',
              backgroundColor:
                budgetStatus.percentageUsed >= 100
                  ? '#f44336'
                  : budgetStatus.percentageUsed >= 80
                  ? '#ff9800'
                  : '#4CAF50',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* Warning message when exceeding 80% */}
      {isWarning && (
        <div
          style={{
            padding: '10px',
            backgroundColor: budgetStatus.percentageUsed >= 100 ? '#ffebee' : '#fff3e0',
            border: `1px solid ${budgetStatus.percentageUsed >= 100 ? '#f44336' : '#ff9800'}`,
            borderRadius: '4px',
            marginTop: '15px'
          }}
        >
          <span style={{ fontWeight: 'bold', color: budgetStatus.percentageUsed >= 100 ? '#f44336' : '#ff9800' }}>
            {budgetStatus.percentageUsed >= 100 ? '⚠️ Budget Exceeded!' : '⚠️ Warning!'}
          </span>
          <span style={{ marginLeft: '10px' }}>
            {budgetStatus.percentageUsed >= 100
              ? 'You have exceeded your budget.'
              : 'You have used more than 80% of your budget.'}
          </span>
        </div>
      )}
    </div>
  );
};
