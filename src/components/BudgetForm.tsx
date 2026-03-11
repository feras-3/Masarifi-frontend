import React, { useState, ChangeEvent, FormEvent } from 'react';
import { BudgetRequest, BudgetValidationErrors } from '../types/budget';
import { Category } from '../types/transaction';

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
  const [amount, setAmount] = useState<string>(initialData?.amount?.toString() || '');
  const [category, setCategory] = useState<string>(initialData?.category || '');
  const [periodType, setPeriodType] = useState<'MONTHLY' | 'SPECIFIC'>('MONTHLY');
  const [specificMonth, setSpecificMonth] = useState<string>(
    initialData?.period && initialData.period !== 'MONTHLY'
      ? initialData.period
      : new Date().toISOString().slice(0, 7)
  );

  const [errors, setErrors] = useState<BudgetValidationErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateAmount = (value: string): string | undefined => {
    if (!value || value.trim() === '') return 'Amount is required';
    const num = parseFloat(value);
    if (isNaN(num)) return 'Amount must be a valid number';
    if (num <= 0) return 'Amount must be greater than zero';
    const decimalMatch = value.match(/\.(\d+)$/);
    if (decimalMatch && decimalMatch[1].length > 2) return 'Amount can have at most 2 decimal places';
    return undefined;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMessage(null);

    const amountError = validateAmount(amount);
    if (amountError) {
      setErrors({ amount: amountError });
      return;
    }
    setErrors({});

    const period = periodType === 'MONTHLY' ? 'MONTHLY' : specificMonth;

    const submitData: BudgetRequest = { amount: parseFloat(amount), period };
    if (category) submitData.category = category;

    setIsSubmitting(true);
    try {
      await onSubmit(submitData);
      setAmount('');
      setCategory('');
      setPeriodType('MONTHLY');
      setSuccessMessage('Budget created successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to create budget. Please try again.';
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1.5px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: 'white',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#444',
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '20px 0' }}>

      {/* Amount */}
      <div style={{ marginBottom: '18px' }}>
        <label htmlFor="amount" style={labelStyle}>Budget Amount *</label>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setAmount(e.target.value);
            setErrors(prev => ({ ...prev, amount: validateAmount(e.target.value) }));
          }}
          placeholder="e.g. 500.00"
          style={{ ...inputStyle, borderColor: errors.amount ? '#f44336' : '#e0e0e0' }}
          onFocus={e => e.currentTarget.style.borderColor = '#2c3e50'}
          onBlur={e => e.currentTarget.style.borderColor = errors.amount ? '#f44336' : '#e0e0e0'}
        />
        {errors.amount && (
          <span style={{ color: '#f44336', fontSize: '12px', marginTop: '4px', display: 'block' }}>
            {errors.amount}
          </span>
        )}
      </div>

      {/* Category */}
      <div style={{ marginBottom: '18px' }}>
        <label htmlFor="category" style={labelStyle}>
          Category{' '}
          <span style={{ color: '#999', fontWeight: 400 }}>(optional — leave blank for a general budget)</span>
        </label>
        <select
          id="category"
          value={category}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="">— General Budget (all categories) —</option>
          {Object.values(Category).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Period */}
      <div style={{ marginBottom: '18px' }}>
        <label style={labelStyle}>Period *</label>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
          {(['MONTHLY', 'SPECIFIC'] as const).map(type => (
            <label
              key={type}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#444'
              }}
            >
              <input
                type="radio"
                name="periodType"
                value={type}
                checked={periodType === type}
                onChange={() => setPeriodType(type)}
              />
              {type === 'MONTHLY' ? 'Current month (Monthly)' : 'Specific month'}
            </label>
          ))}
        </div>
        {periodType === 'SPECIFIC' && (
          <input
            type="month"
            value={specificMonth}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSpecificMonth(e.target.value)}
            style={inputStyle}
            onFocus={e => e.currentTarget.style.borderColor = '#2c3e50'}
            onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'}
          />
        )}
        {periodType === 'MONTHLY' && (
          <div style={{ fontSize: '13px', color: '#888' }}>
            Will apply to: {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </div>
        )}
      </div>

      {/* API Error */}
      {apiError && (
        <div style={{
          marginBottom: '16px',
          padding: '12px 14px',
          backgroundColor: '#fff0f0',
          border: '1px solid #ffcdd2',
          borderRadius: '8px',
          color: '#c62828',
          fontSize: '14px'
        }}>
          {apiError}
        </div>
      )}

      {/* Success */}
      {successMessage && (
        <div style={{
          marginBottom: '16px',
          padding: '12px 14px',
          backgroundColor: '#f0fff4',
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          color: '#155724',
          fontSize: '14px'
        }}>
          {successMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          padding: '11px 24px',
          backgroundColor: isSubmitting ? '#7986a3' : '#2c3e50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: 600,
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s'
        }}
      >
        {isSubmitting ? 'Creating...' : submitLabel}
      </button>
    </form>
  );
};
