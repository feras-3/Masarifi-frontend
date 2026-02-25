import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Category, TransactionRequest, ValidationErrors } from '../types/transaction';

interface TransactionFormProps {
  onSubmit: (transaction: TransactionRequest) => Promise<void>;
  initialData?: Partial<TransactionRequest>;
  submitLabel?: string;
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
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
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

  const validateDate = (value: string): string | undefined => {
    if (!value) {
      return 'Date is required';
    }
    
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (selectedDate > today) {
      return 'Date cannot be in the future';
    }
    
    return undefined;
  };

  const validateDescription = (value: string): string | undefined => {
    if (!value || value.trim() === '') {
      return 'Description is required';
    }
    
    if (value.length > 200) {
      return 'Description cannot exceed 200 characters';
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

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, date: value }));
    
    const error = validateDate(value);
    setErrors(prev => ({ ...prev, date: error }));
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, description: value }));
    
    const error = validateDescription(value);
    setErrors(prev => ({ ...prev, description: error }));
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as Category;
    setFormData(prev => ({ ...prev, category: value }));
  };

  const hasErrors = (): boolean => {
    return Object.values(errors).some(error => error !== undefined);
  };

  const validateAll = (): boolean => {
    const newErrors: ValidationErrors = {
      amount: validateAmount(formData.amount.toString()),
      date: validateDate(formData.date),
      description: validateDescription(formData.description),
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
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: Category.OTHER
      });
      setErrors({});
    } catch (error) {
      console.error('Error submitting transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '20px 0' }}>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="amount" style={{ display: 'block', marginBottom: '5px' }}>
          Amount *
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
        <label htmlFor="date" style={{ display: 'block', marginBottom: '5px' }}>
          Date *
        </label>
        <input
          id="date"
          type="date"
          value={formData.date}
          onChange={handleDateChange}
          style={{
            width: '100%',
            padding: '8px',
            border: errors.date ? '1px solid red' : '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
        {errors.date && (
          <span style={{ color: 'red', fontSize: '12px' }}>{errors.date}</span>
        )}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="description" style={{ display: 'block', marginBottom: '5px' }}>
          Description *
        </label>
        <input
          id="description"
          type="text"
          value={formData.description}
          onChange={handleDescriptionChange}
          maxLength={200}
          style={{
            width: '100%',
            padding: '8px',
            border: errors.description ? '1px solid red' : '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
        {errors.description && (
          <span style={{ color: 'red', fontSize: '12px' }}>{errors.description}</span>
        )}
        <span style={{ fontSize: '12px', color: '#666' }}>
          {formData.description.length}/200 characters
        </span>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="category" style={{ display: 'block', marginBottom: '5px' }}>
          Category *
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={handleCategoryChange}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        >
          {Object.values(Category).map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
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
