import React, { useState, ChangeEvent, FormEvent } from 'react'
import {
  Category,
  TransactionRequest,
  ValidationErrors
} from '../types/transaction'

interface TransactionFormProps {
  onSubmit: (transaction: TransactionRequest) => Promise<void>
  initialData?: Partial<TransactionRequest>
  submitLabel?: string
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  initialData,
  submitLabel = 'Add Transaction'
}) => {
  const [formData, setFormData] = useState<TransactionRequest>({
    amount: initialData?.amount || 0,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    description: initialData?.description || '',
    category: initialData?.category || Category.OTHER
  })

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Validation functions
  const validateAmount = (value: string): string | undefined => {
    if (!value || value.trim() === '') {
      return 'Amount is required'
    }

    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
      return 'Amount must be a valid number'
    }

    if (numValue <= 0) {
      return 'Amount must be greater than zero'
    }

    // Check for max 2 decimal places
    const decimalMatch = value.match(/\.(\d+)$/)
    if (decimalMatch && decimalMatch[1].length > 2) {
      return 'Amount can have at most 2 decimal places'
    }

    return undefined
  }

  const validateDate = (value: string): string | undefined => {
    if (!value) {
      return 'Date is required'
    }

    const selectedDate = new Date(value)
    const today = new Date()
    today.setHours(23, 59, 59, 999) // End of today

    if (selectedDate > today) {
      return 'Date cannot be in the future'
    }

    return undefined
  }

  const validateDescription = (value: string): string | undefined => {
    if (!value || value.trim() === '') {
      return 'Description is required'
    }

    if (value.length > 200) {
      return 'Description cannot exceed 200 characters'
    }

    return undefined
  }

  // Handle input changes with validation
  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, amount: parseFloat(value) || 0 }))

    const error = validateAmount(value)
    setErrors((prev) => ({ ...prev, amount: error }))
  }

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, date: value }))

    const error = validateDate(value)
    setErrors((prev) => ({ ...prev, date: error }))
  }

  const handleDescriptionChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, description: value }))

    const error = validateDescription(value)
    setErrors((prev) => ({ ...prev, description: error }))
  }

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as Category
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const hasErrors = (): boolean => {
    return Object.values(errors).some((error) => error !== undefined)
  }

  const validateAll = (): boolean => {
    const newErrors: ValidationErrors = {
      amount: validateAmount(formData.amount.toString()),
      date: validateDate(formData.date),
      description: validateDescription(formData.description)
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error !== undefined)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateAll()) {
      return
    }

    setIsSubmitting(true)
    setSuccessMessage(null)
    try {
      await onSubmit(formData)
      // Reset form after successful submission
      setFormData({
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: Category.OTHER
      })
      setErrors({})
      setSuccessMessage('Transaction added successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      console.error('Error submitting transaction:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: 'white',
    transition: 'border-color 0.2s ease'
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#2c3e50'
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', margin: '0' }}>
      {/* Amount */}
      <div style={{ marginBottom: '24px' }}>
        <label htmlFor="amount" style={labelStyle}>
          Amount <span style={{ color: '#f44336' }}>*</span>
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
            value={formData.amount || ''}
            onChange={handleAmountChange}
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

      {/* Date */}
      <div style={{ marginBottom: '24px' }}>
        <label htmlFor="date" style={labelStyle}>
          Date <span style={{ color: '#f44336' }}>*</span>
        </label>
        <input
          id="date"
          type="date"
          value={formData.date}
          onChange={handleDateChange}
          style={{
            ...inputStyle,
            borderColor: errors.date ? '#f44336' : '#e0e0e0'
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = errors.date
              ? '#f44336'
              : '#2c3e50')
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = errors.date
              ? '#f44336'
              : '#e0e0e0')
          }
        />
        {errors.date && (
          <span
            style={{
              color: '#f44336',
              fontSize: '13px',
              marginTop: '6px',
              display: 'block'
            }}
          >
            {errors.date}
          </span>
        )}
      </div>

      {/* Description */}
      <div style={{ marginBottom: '24px' }}>
        <label htmlFor="description" style={labelStyle}>
          Description <span style={{ color: '#f44336' }}>*</span>
        </label>
        <input
          id="description"
          type="text"
          value={formData.description}
          onChange={handleDescriptionChange}
          maxLength={200}
          placeholder="e.g., Grocery shopping at Whole Foods"
          style={{
            ...inputStyle,
            borderColor: errors.description ? '#f44336' : '#e0e0e0'
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = errors.description
              ? '#f44336'
              : '#2c3e50')
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = errors.description
              ? '#f44336'
              : '#e0e0e0')
          }
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '6px'
          }}
        >
          {errors.description ? (
            <span style={{ color: '#f44336', fontSize: '13px' }}>
              {errors.description}
            </span>
          ) : (
            <span></span>
          )}
          <span style={{ fontSize: '12px', color: '#999' }}>
            {formData.description.length}/200
          </span>
        </div>
      </div>

      {/* Category */}
      <div style={{ marginBottom: '28px' }}>
        <label htmlFor="category" style={labelStyle}>
          Category <span style={{ color: '#f44336' }}>*</span>
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={handleCategoryChange}
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
          {Object.values(Category).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Success Message */}
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

      {/* Submit Button */}
      <button
        type="submit"
        disabled={hasErrors() || isSubmitting}
        style={{
          width: '100%',
          padding: '14px 24px',
          backgroundColor: hasErrors() || isSubmitting ? '#ccc' : '#2c3e50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: 600,
          cursor: hasErrors() || isSubmitting ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          boxShadow:
            hasErrors() || isSubmitting ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
        }}
        onMouseEnter={(e) => {
          if (!hasErrors() && !isSubmitting) {
            e.currentTarget.style.backgroundColor = '#1a252f'
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'
          }
        }}
        onMouseLeave={(e) => {
          if (!hasErrors() && !isSubmitting) {
            e.currentTarget.style.backgroundColor = '#2c3e50'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
          }
        }}
      >
        {isSubmitting ? 'Adding Transaction...' : submitLabel}
      </button>
    </form>
  )
}
