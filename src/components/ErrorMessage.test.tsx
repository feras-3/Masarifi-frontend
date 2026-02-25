import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorMessage, { ApiError } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders nothing when error is null', () => {
    const { container } = render(<ErrorMessage error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders string error message', () => {
    render(<ErrorMessage error="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders API error with message field', () => {
    const error: ApiError = {
      message: 'Validation failed'
    };
    render(<ErrorMessage error={error} />);
    expect(screen.getByText('Validation failed')).toBeInTheDocument();
  });

  it('renders API error with error field', () => {
    const error: ApiError = {
      error: 'Server error'
    };
    render(<ErrorMessage error={error} />);
    expect(screen.getByText('Server error')).toBeInTheDocument();
  });

  it('renders field-level validation errors', () => {
    const error: ApiError = {
      message: 'Validation failed',
      fields: {
        amount: 'Must be greater than zero',
        description: 'Cannot be empty'
      }
    };
    render(<ErrorMessage error={error} />);
    
    expect(screen.getByText('Validation failed')).toBeInTheDocument();
    expect(screen.getByText(/amount:/)).toBeInTheDocument();
    expect(screen.getByText(/Must be greater than zero/)).toBeInTheDocument();
    expect(screen.getByText(/description:/)).toBeInTheDocument();
    expect(screen.getByText(/Cannot be empty/)).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', async () => {
    const onDismiss = vi.fn();
    render(<ErrorMessage error="Test error" onDismiss={onDismiss} />);
    
    const dismissButton = screen.getByLabelText('Dismiss error');
    await userEvent.click(dismissButton);
    
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not render dismiss button when onDismiss is not provided', () => {
    render(<ErrorMessage error="Test error" />);
    expect(screen.queryByLabelText('Dismiss error')).not.toBeInTheDocument();
  });

  it('renders default message for empty error object', () => {
    const error: ApiError = {};
    render(<ErrorMessage error={error} />);
    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
  });
});
