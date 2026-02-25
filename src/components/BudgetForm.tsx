import React, { useState, ChangeEvent, FormEvent } from 'react';
import { BudgetRequest, BudgetValidationErrors } from '../types/budget';

interface BudgetFormProps {
  onSubmit: (budget: BudgetRequest) => Promise<void>;
  initialData?: Partial<BudgetRequest>;
  submitLabel?: string;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({
  onSubmit,
  initialData,
  submitLabel = 'Set Budget'
}) => {
  const [formData, setFormData] = useState<BudgetRequest>({
    amount: initialData?.amount || 0,
    period: initialData?.period || new Date().toISOString().slice(0, 7) // YYYY-MM format
  });

  const [errors, setErrors] = useState<BudgetValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation function for amount
  const validateAmount = (value: string): string | undefined => {
    if (!value || value.trim() === '') {
      return 'Amount is required';
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return 'Amount must be a valid number';
    }
    
    if (numValue <= 0) {
      return 'Amount must be greater than zero';
    }
    
    // Check for max 2 decimal places
    const decimalMatch = value.match(/\.(\d+)$/);
    if (decimalMatch && decimalMatch[1].length > 2) {
      return 'Amount can have at most 2 decimal places';
    }
    
    return undefined;
  };

  const validatePeriod = (value: string): string | undefined => {
    if (!value) {
      return 'Period is required';
    }
    return undefined;
  };

  // Handle input changes with validation
  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, amount: parseFloat(value) || 0 }));
    
    const error = validateAmount(value);
    setErrors(prev => ({ ...prev, amount: error }));
  };

  const handlePeriodChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, period: value }));
    
    const error = validatePeriod(value);
    setErrors(prev => ({ ...prev, period: error }));
  };

  const hasErrors = (): boolean => {
    return Object.values(errors).some(error => error !== undefined);
  };

  const validateAll = (): boolean => {
    const newErrors: BudgetValidationErrors = {
      amount: validateAmount(formData.amount.toString()),
      period: validatePeriod(formData.period),
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateAll()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        amount: 0,
        period: new Date().toISOString().slice(0, 7)
      });
      setErrors({});
    } catch (error) {
      console.error('Error submitting budget:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '20px 0' }}>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="amount" style={{ display: 'block', marginBottom: '5px' }}>
          Budget Amount *
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          value={formData.amount || ''}
          onChange={handleAmountChange}
          style={{
            width: '100%',
            padding: '8px',
            border: errors.amount ? '1px solid red' : '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
        {errors.amount && (
          <span style={{ color: 'red', fontSize: '12px' }}>{errors.amount}</span>
        )}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="period" style={{ display: 'block', marginBottom: '5px' }}>
          Period (Month) *
        </label>
        <input
          id="period"
          type="month"
          value={formData.period}
          onChange={handlePeriodChange}
          style={{
            width: '100%',
            padding: '8px',
            border: errors.period ? '1px solid red' : '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
        {errors.period && (
          <span style={{ color: 'red', fontSize: '12px' }}>{errors.period}</span>
        )}
      </div>

      <button
        type="submit"
        disabled={hasErrors() || isSubmitting}
        style={{
          padding: '10px 20px',
          backgroundColor: hasErrors() || isSubmitting ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: hasErrors() || isSubmitting ? 'not-allowed' : 'pointer'
        }}
      >
        {isSubmitting ? 'Submitting...' : submitLabel}
      </button>
    </form>
  );
};
