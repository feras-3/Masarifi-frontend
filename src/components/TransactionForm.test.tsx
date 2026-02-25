import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TransactionForm } from './TransactionForm';
import { Category } from '../types/transaction';

describe('TransactionForm', () => {
  it('renders all form fields', () => {
    const mockOnSubmit = vi.fn();
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
  });

  it('displays validation error for zero amount', async () => {
    const mockOnSubmit = vi.fn();
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    const amountInput = screen.getByLabelText(/amount/i);
    fireEvent.change(amountInput, { target: { value: '0' } });

    await waitFor(() => {
      expect(screen.getByText(/amount must be greater than zero/i)).toBeInTheDocument();
    });
  });

  it('displays validation error for negative amount', async () => {
    const mockOnSubmit = vi.fn();
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    const amountInput = screen.getByLabelText(/amount/i);
    fireEvent.change(amountInput, { target: { value: '-10' } });

    await waitFor(() => {
      expect(screen.getByText(/amount must be greater than zero/i)).toBeInTheDocument();
    });
  });

  it('displays validation error for amount with more than 2 decimal places', async () => {
    const mockOnSubmit = vi.fn();
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    const amountInput = screen.getByLabelText(/amount/i);
    fireEvent.change(amountInput, { target: { value: '10.123' } });

    await waitFor(() => {
      expect(screen.getByText(/at most 2 decimal places/i)).toBeInTheDocument();
    });
  });

  it('displays validation error for future date', async () => {
    const mockOnSubmit = vi.fn();
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const futureDateString = futureDate.toISOString().split('T')[0];

    const dateInput = screen.getByLabelText(/date/i);
    fireEvent.change(dateInput, { target: { value: futureDateString } });

    await waitFor(() => {
      expect(screen.getByText(/date cannot be in the future/i)).toBeInTheDocument();
    });
  });

  it('displays validation error for empty description', async () => {
    const mockOnSubmit = vi.fn();
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    const descriptionInput = screen.getByLabelText(/description/i);
    // First add some text, then clear it to trigger validation
    fireEvent.change(descriptionInput, { target: { value: 'test' } });
    fireEvent.change(descriptionInput, { target: { value: '' } });

    await waitFor(() => {
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    });
  });

  it('displays validation error for description exceeding 200 characters', async () => {
    const mockOnSubmit = vi.fn();
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    const longDescription = 'a'.repeat(201);
    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: longDescription } });

    await waitFor(() => {
      expect(screen.getByText(/cannot exceed 200 characters/i)).toBeInTheDocument();
    });
  });

  it('disables submit button when there are validation errors', async () => {
    const mockOnSubmit = vi.fn();
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    const amountInput = screen.getByLabelText(/amount/i);
    fireEvent.change(amountInput, { target: { value: '-10' } });

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /add transaction/i });
      expect(submitButton).toBeDisabled();
    });
  });

  it('submits form with valid data', async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    const amountInput = screen.getByLabelText(/amount/i);
    const dateInput = screen.getByLabelText(/date/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const categorySelect = screen.getByLabelText(/category/i);

    fireEvent.change(amountInput, { target: { value: '50.25' } });
    fireEvent.change(dateInput, { target: { value: '2024-01-15' } });
    fireEvent.change(descriptionInput, { target: { value: 'Grocery shopping' } });
    fireEvent.change(categorySelect, { target: { value: Category.FOOD } });

    const submitButton = screen.getByRole('button', { name: /add transaction/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        amount: 50.25,
        date: '2024-01-15',
        description: 'Grocery shopping',
        category: Category.FOOD
      });
    });
  });

  it('shows character count for description', () => {
    const mockOnSubmit = vi.fn();
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Test' } });

    expect(screen.getByText(/4\/200 characters/i)).toBeInTheDocument();
  });
});
