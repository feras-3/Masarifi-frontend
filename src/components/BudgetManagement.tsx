import React, { useState } from 'react';
import { BudgetForm } from './BudgetForm';
import { BudgetSummary } from './BudgetSummary';
import { budgetService } from '../services/budgetService';
import { BudgetRequest } from '../types/budget';

export const BudgetManagement: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleBudgetSubmit = async (budgetData: BudgetRequest) => {
    try {
      await budgetService.createBudget(budgetData);
      setMessage({ text: 'Budget created successfully!', type: 'success' });
      setRefreshTrigger(prev => prev + 1);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create budget. Please try again.';
      setMessage({ text: errorMessage, type: 'error' });
      console.error('Error creating budget:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Budget Management</h1>

      {message && (
        <div
          style={{
            padding: '10px 15px',
            marginBottom: '20px',
            borderRadius: '4px',
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
          }}
        >
          {message.text}
        </div>
      )}

      <BudgetSummary refreshTrigger={refreshTrigger} />

      <div style={{ marginTop: '30px' }}>
        <h2>Set New Budget</h2>
        <BudgetForm onSubmit={handleBudgetSubmit} />
      </div>
    </div>
  );
};
