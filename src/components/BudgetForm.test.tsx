import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BudgetForm } from './BudgetForm';

describe('BudgetForm', () => {
  it('renders all form fields', () => {
    const mockOnSubmit = vi.fn();
    render(<BudgetForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/budget amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/period/i)).toBeInTheDocument();
  });

  it('displays validation error for zero amount', async () => {
    const mockOnSubmit = vi.fn();
    render(<BudgetForm onSubmit={mockOnSubmit} />);

    const amountInput = screen.getByLabelText(/budget amount/i);
    fireEvent.change(amountInput, { target: { value: '0' } });

    await waitFor(() => {
      expect(screen.getByText(/amount must be greater than zero/i)).toBeInTheDocument();
    });
  });

  it('displays validation error for negative amount', async () => {
    const mockOnSubmit = vi.fn();
    render(<BudgetForm onSubmit={mockOnSubmit} />);

    const amountInput = screen.getByLabelText(/budget amount/i);
    fireEvent.change(amountInput, { target: { value: '-100' } });

    await waitFor(() => {
      expect(screen.getByText(/amount must be greater than zero/i)).toBeInTheDocument();
    });
  });

  it('displays validation error for amount with more than 2 decimal places', async () => {
    const mockOnSubmit = vi.fn();
    render(<BudgetForm onSubmit={mockOnSubmit} />);

    const amountInput = screen.getByLabelText(/budget amount/i);
    fireEvent.change(amountInput, { target: { value: '1000.123' } });

    await waitFor(() => {
      expect(screen.getByText(/at most 2 decimal places/i)).toBeInTheDocument();
    });
  });

  it('accepts valid amount with 2 decimal places', async () => {
    const mockOnSubmit = vi.fn();
    render(<BudgetForm onSubmit={mockOnSubmit} />);

    const amountInput = screen.getByLabelText(/budget amount/i);
    fireEvent.change(amountInput, { target: { value: '1000.50' } });

    await waitFor(() => {
      expect(screen.queryByText(/at most 2 decimal places/i)).not.toBeInTheDocument();
    });
  });

  it('disables submit button when there are validation errors', async () => {
    const mockOnSubmit = vi.fn();
    render(<BudgetForm onSubmit={mockOnSubmit} />);

    const amountInput = screen.getByLabelText(/budget amount/i);
    fireEvent.change(amountInput, { target: { value: '-100' } });

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /set budget/i });
      expect(submitButton).toBeDisabled();
    });
  });

  it('submits form with valid data', async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    render(<BudgetForm onSubmit={mockOnSubmit} />);

    const amountInput = screen.getByLabelText(/budget amount/i);
    const periodInput = screen.getByLabelText(/period/i);

    fireEvent.change(amountInput, { target: { value: '2000' } });
    fireEvent.change(periodInput, { target: { value: '2024-01' } });

    const submitButton = screen.getByRole('button', { name: /set budget/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        amount: 2000,
        period: '2024-01'
      });
    });
  });

  it('resets form after successful submission', async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    render(<BudgetForm onSubmit={mockOnSubmit} />);

    const amountInput = screen.getByLabelText(/budget amount/i) as HTMLInputElement;
    const periodInput = screen.getByLabelText(/period/i) as HTMLInputElement;

    fireEvent.change(amountInput, { target: { value: '2000' } });
    fireEvent.change(periodInput, { target: { value: '2024-01' } });

    const submitButton = screen.getByRole('button', { name: /set budget/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    // Check that form is reset - amount should be empty string when value is 0
    await waitFor(() => {
      expect(amountInput.value).toBe('');
    });
  });

  it('displays submitting state during form submission', async () => {
    const mockOnSubmit = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<BudgetForm onSubmit={mockOnSubmit} />);

    const amountInput = screen.getByLabelText(/budget amount/i);
    const periodInput = screen.getByLabelText(/period/i);

    fireEvent.change(amountInput, { target: { value: '2000' } });
    fireEvent.change(periodInput, { target: { value: '2024-01' } });

    const submitButton = screen.getByRole('button', { name: /set budget/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/submitting/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByText(/submitting/i)).not.toBeInTheDocument();
    });
  });

  it('uses custom submit label when provided', () => {
    const mockOnSubmit = vi.fn();
    render(<BudgetForm onSubmit={mockOnSubmit} submitLabel="Update Budget" />);

    expect(screen.getByRole('button', { name: /update budget/i })).toBeInTheDocument();
  });

  it('populates form with initial data when provided', () => {
    const mockOnSubmit = vi.fn();
    const initialData = {
      amount: 1500,
      period: '2024-02'
    };

    render(<BudgetForm onSubmit={mockOnSubmit} initialData={initialData} />);

    const amountInput = screen.getByLabelText(/budget amount/i) as HTMLInputElement;
    const periodInput = screen.getByLabelText(/period/i) as HTMLInputElement;

    expect(amountInput.value).toBe('1500');
    expect(periodInput.value).toBe('2024-02');
  });
});
