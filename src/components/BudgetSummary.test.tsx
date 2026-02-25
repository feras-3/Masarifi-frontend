import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BudgetSummary } from './BudgetSummary';
import { budgetService } from '../services/budgetService';
import { BudgetStatus } from '../types/budget';

vi.mock('../services/budgetService');

describe('BudgetSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays loading state initially', () => {
    vi.mocked(budgetService.getCurrentBudgetStatus).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<BudgetSummary />);
    expect(screen.getByText(/loading budget status/i)).toBeInTheDocument();
  });

  it('displays message when no budget exists', async () => {
    const error = { response: { status: 404 } };
    vi.mocked(budgetService.getCurrentBudgetStatus).mockRejectedValue(error);

    render(<BudgetSummary />);

    await waitFor(() => {
      expect(screen.getByText(/no budget set/i)).toBeInTheDocument();
    });
  });

  it('displays error message on fetch failure', async () => {
    const error = { response: { status: 500 } };
    vi.mocked(budgetService.getCurrentBudgetStatus).mockRejectedValue(error);

    render(<BudgetSummary />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load budget status/i)).toBeInTheDocument();
    });
  });

  it('displays budget status with all required fields', async () => {
    const mockStatus: BudgetStatus = {
      budgetId: '123',
      amount: 2000,
      spent: 500,
      remaining: 1500,
      percentageUsed: 25,
      period: '2024-01'
    };

    vi.mocked(budgetService.getCurrentBudgetStatus).mockResolvedValue(mockStatus);

    render(<BudgetSummary />);

    await waitFor(() => {
      expect(screen.getByText(/budget summary/i)).toBeInTheDocument();
      expect(screen.getByText('2024-01')).toBeInTheDocument();
      expect(screen.getByText('$2000.00')).toBeInTheDocument();
      expect(screen.getByText('$500.00')).toBeInTheDocument();
      expect(screen.getByText('$1500.00')).toBeInTheDocument();
      expect(screen.getByText('25.0%')).toBeInTheDocument();
    });
  });

  it('displays remaining balance in green when under 80%', async () => {
    const mockStatus: BudgetStatus = {
      budgetId: '123',
      amount: 2000,
      spent: 1000,
      remaining: 1000,
      percentageUsed: 50,
      period: '2024-01'
    };

    vi.mocked(budgetService.getCurrentBudgetStatus).mockResolvedValue(mockStatus);

    render(<BudgetSummary />);

    await waitFor(() => {
      // Get all elements with $1000.00 and find the one with green color (remaining balance)
      const elements = screen.getAllByText('$1000.00');
      const remainingElement = elements.find((el: HTMLElement) => 
        el.style.color === 'rgb(76, 175, 80)' // #4CAF50 in rgb
      );
      expect(remainingElement).toBeDefined();
      expect(remainingElement).toHaveStyle({ color: '#4CAF50' });
    });
  });

  it('displays remaining balance in warning color when at 80%', async () => {
    const mockStatus: BudgetStatus = {
      budgetId: '123',
      amount: 2000,
      spent: 1600,
      remaining: 400,
      percentageUsed: 80,
      period: '2024-01'
    };

    vi.mocked(budgetService.getCurrentBudgetStatus).mockResolvedValue(mockStatus);

    render(<BudgetSummary />);

    await waitFor(() => {
      const remainingElement = screen.getByText('$400.00');
      expect(remainingElement).toHaveStyle({ color: '#ff9800' });
    });
  });

  it('displays remaining balance in warning color when exceeding 80%', async () => {
    const mockStatus: BudgetStatus = {
      budgetId: '123',
      amount: 2000,
      spent: 1800,
      remaining: 200,
      percentageUsed: 90,
      period: '2024-01'
    };

    vi.mocked(budgetService.getCurrentBudgetStatus).mockResolvedValue(mockStatus);

    render(<BudgetSummary />);

    await waitFor(() => {
      const remainingElement = screen.getByText('$200.00');
      expect(remainingElement).toHaveStyle({ color: '#ff9800' });
    });
  });

  it('displays warning message when spending exceeds 80%', async () => {
    const mockStatus: BudgetStatus = {
      budgetId: '123',
      amount: 2000,
      spent: 1700,
      remaining: 300,
      percentageUsed: 85,
      period: '2024-01'
    };

    vi.mocked(budgetService.getCurrentBudgetStatus).mockResolvedValue(mockStatus);

    render(<BudgetSummary />);

    await waitFor(() => {
      expect(screen.getByText(/warning/i)).toBeInTheDocument();
      expect(screen.getByText(/used more than 80% of your budget/i)).toBeInTheDocument();
    });
  });

  it('displays critical message when budget is exceeded', async () => {
    const mockStatus: BudgetStatus = {
      budgetId: '123',
      amount: 2000,
      spent: 2100,
      remaining: -100,
      percentageUsed: 105,
      period: '2024-01'
    };

    vi.mocked(budgetService.getCurrentBudgetStatus).mockResolvedValue(mockStatus);

    render(<BudgetSummary />);

    await waitFor(() => {
      expect(screen.getByText(/budget exceeded/i)).toBeInTheDocument();
      expect(screen.getByText(/you have exceeded your budget/i)).toBeInTheDocument();
    });
  });

  it('displays progress bar with correct percentage', async () => {
    const mockStatus: BudgetStatus = {
      budgetId: '123',
      amount: 2000,
      spent: 1000,
      remaining: 1000,
      percentageUsed: 50,
      period: '2024-01'
    };

    vi.mocked(budgetService.getCurrentBudgetStatus).mockResolvedValue(mockStatus);

    render(<BudgetSummary />);

    await waitFor(() => {
      expect(screen.getByText('50.0%')).toBeInTheDocument();
    });
  });

  it('refetches data when refreshTrigger changes', async () => {
    const mockStatus: BudgetStatus = {
      budgetId: '123',
      amount: 2000,
      spent: 500,
      remaining: 1500,
      percentageUsed: 25,
      period: '2024-01'
    };

    vi.mocked(budgetService.getCurrentBudgetStatus).mockResolvedValue(mockStatus);

    const { rerender } = render(<BudgetSummary refreshTrigger={0} />);

    await waitFor(() => {
      expect(budgetService.getCurrentBudgetStatus).toHaveBeenCalledTimes(1);
    });

    rerender(<BudgetSummary refreshTrigger={1} />);

    await waitFor(() => {
      expect(budgetService.getCurrentBudgetStatus).toHaveBeenCalledTimes(2);
    });
  });

  it('does not display warning when spending is below 80%', async () => {
    const mockStatus: BudgetStatus = {
      budgetId: '123',
      amount: 2000,
      spent: 1000,
      remaining: 1000,
      percentageUsed: 50,
      period: '2024-01'
    };

    vi.mocked(budgetService.getCurrentBudgetStatus).mockResolvedValue(mockStatus);

    render(<BudgetSummary />);

    await waitFor(() => {
      expect(screen.queryByText(/warning/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/budget exceeded/i)).not.toBeInTheDocument();
    });
  });
});
