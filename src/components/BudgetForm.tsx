import React, { useState, ChangeEvent, FormEvent } from 'react'
import { BudgetRequest, BudgetValidationErrors } from '../types/budget'
import { Category } from '../types/transaction'
import { useTheme } from '../contexts/ThemeContext'

interface BudgetFormProps {
  onSubmit: (budget: BudgetRequest) => Promise<void>
  initialData?: Partial<BudgetRequest>
  submitLabel?: string
}

export const BudgetForm: React.FC<BudgetFormProps> = ({
  onSubmit,
  initialData,
  submitLabel = 'Set Budget'
}) => {
  const { isDarkMode } = useTheme()
  const [amount, setAmount] = useState<string>(
    initialData?.amount?.toString() || ''
  )
  const [category, setCategory] = useState<string>(initialData?.category || '')
  const [periodType, setPeriodType] = useState<'MONTHLY' | 'SPECIFIC'>(
    'MONTHLY'
  )
  const [specificMonth, setSpecificMonth] = useState<string>(
    initialData?.period && initialData.period !== 'MONTHLY'
      ? initialData.period
      : new Date().toISOString().slice(0, 7)
  )

  const [errors, setErrors] = useState<BudgetValidationErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const validateAmount = (value: string): string | undefined => {
    if (!value || value.trim() === '') return 'Amount is required'
    const num = parseFloat(value)
    if (isNaN(num)) return 'Amount must be a valid number'
    if (num <= 0) return 'Amount must be greater than zero'
    const decimalMatch = value.match(/\.(\d+)$/)
    if (decimalMatch && decimalMatch[1].length > 2)
      return 'Amount can have at most 2 decimal places'
    return undefined
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setApiError(null)
    setSuccessMessage(null)

    const amountError = validateAmount(amount)
    if (amountError) {
      setErrors({ amount: amountError })
      return
    }
    setErrors({})

    const period = periodType === 'MONTHLY' ? 'MONTHLY' : specificMonth

    const submitData: BudgetRequest = { amount: parseFloat(amount), period }
    if (category) submitData.category = category

    setIsSubmitting(true)
    try {
      await onSubmit(submitData)
      setAmount('')
      setCategory('')
      setPeriodType('MONTHLY')
      setSuccessMessage('Budget created successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to create budget. Please try again.'
      setApiError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    border: `1.5px solid ${isDarkMode ? '#2c3e50' : '#e0e0e0'}`,
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: isDarkMode ? '#0f3460' : 'white',
    color: isDarkMode ? '#e0e0e0' : '#333',
    transition: 'border-color 0.2s ease'
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: isDarkMode ? '#e0e0e0' : '#2c3e50'
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', margin: '0' }}>
      {/* Amount */}
      <div style={{ marginBottom: '24px' }}>
        <label htmlFor="amount" style={labelStyle}>
          Budget Amount <span style={{ color: '#f44336' }}>*</span>
        </label>
        <div style={{ position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '16px',
              color: '#666',
              fontWeight: 600
            }}
          >
            $
          </span>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setAmount(e.target.value)
              setErrors((prev) => ({
                ...prev,
                amount: validateAmount(e.target.value)
              }))
            }}
            placeholder="0.00"
            style={{
              ...inputStyle,
              paddingLeft: '32px',
              borderColor: errors.amount ? '#f44336' : '#e0e0e0'
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = errors.amount
                ? '#f44336'
                : '#2c3e50')
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = errors.amount
                ? '#f44336'
                : '#e0e0e0')
            }
          />
        </div>
        {errors.amount && (
          <span
            style={{
              color: '#f44336',
              fontSize: '13px',
              marginTop: '6px',
              display: 'block'
            }}
          >
            {errors.amount}
          </span>
        )}
      </div>

      {/* Category */}
      <div style={{ marginBottom: '24px' }}>
        <label htmlFor="category" style={labelStyle}>
          Category{' '}
          <span style={{ color: '#999', fontWeight: 400, fontSize: '13px' }}>
            (optional)
          </span>
        </label>
        <select
          id="category"
          value={category}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setCategory(e.target.value)
          }
          style={{
            ...inputStyle,
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 14px center',
            paddingRight: '40px'
          }}
        >
          <option value="">General Budget (all categories)</option>
          {Object.values(Category).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <div style={{ fontSize: '13px', color: '#666', marginTop: '6px' }}>
          Leave blank to create a budget for all spending
        </div>
      </div>

      {/* Period */}
      <div style={{ marginBottom: '28px' }}>
        <label style={labelStyle}>
          Period <span style={{ color: '#f44336' }}>*</span>
        </label>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
          {(['MONTHLY', 'SPECIFIC'] as const).map((type) => (
            <label
              key={type}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#2c3e50',
                padding: '10px 16px',
                border: '1.5px solid',
                borderColor: periodType === type ? '#2c3e50' : '#e0e0e0',
                borderRadius: '8px',
                backgroundColor: periodType === type ? '#f8f9fa' : 'white',
                transition: 'all 0.2s ease',
                flex: 1
              }}
            >
              <input
                type="radio"
                name="periodType"
                value={type}
                checked={periodType === type}
                onChange={() => setPeriodType(type)}
                style={{ cursor: 'pointer' }}
              />
              {type === 'MONTHLY' ? 'Monthly' : 'Specific Month'}
            </label>
          ))}
        </div>
        {periodType === 'SPECIFIC' && (
          <input
            type="month"
            value={specificMonth}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSpecificMonth(e.target.value)
            }
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#2c3e50')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#e0e0e0')}
          />
        )}
        {periodType === 'MONTHLY' && (
          <div
            style={{
              fontSize: '13px',
              color: '#666',
              padding: '12px 14px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}
          >
            📅 Will apply to:{' '}
            {new Date().toLocaleString('default', {
              month: 'long',
              year: 'numeric'
            })}
          </div>
        )}
      </div>

      {/* API Error */}
      {apiError && (
        <div
          style={{
            marginBottom: '20px',
            padding: '14px 16px',
            backgroundColor: '#fff0f0',
            border: '1px solid #ffcdd2',
            borderRadius: '8px',
            color: '#c62828',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          ⚠️ {apiError}
        </div>
      )}

      {/* Success */}
      {successMessage && (
        <div
          style={{
            marginBottom: '20px',
            padding: '14px 16px',
            backgroundColor: '#f0fff4',
            border: '1px solid #c3e6cb',
            borderRadius: '8px',
            color: '#155724',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          ✓ {successMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          width: '100%',
          padding: '14px 24px',
          backgroundColor: isSubmitting ? '#ccc' : '#2c3e50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: 600,
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isSubmitting ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
        }}
        onMouseEnter={(e) => {
          if (!isSubmitting) {
            e.currentTarget.style.backgroundColor = '#1a252f'
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isSubmitting) {
            e.currentTarget.style.backgroundColor = '#2c3e50'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
          }
        }}
      >
        {isSubmitting ? 'Saving Budget...' : submitLabel}
      </button>
    </form>
  )
}
