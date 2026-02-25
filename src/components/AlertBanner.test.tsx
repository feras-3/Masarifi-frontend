import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertBanner } from './AlertBanner';
import { alertService } from '../services/alertService';
import { Alert } from '../types/alert';

// Mock the alert service
vi.mock('../services/alertService', () => ({
  alertService: {
    getAlerts: vi.fn(),
    dismissAlert: vi.fn()
  }
}));

describe('AlertBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display warning alert with correct styling', async () => {
    const mockAlerts: Alert[] = [
      {
        id: '1',
        userId: 'user1',
        type: 'WARNING',
        budgetAmount: 1000,
        currentSpending: 850,
        percentageExceeded: 85,
        createdAt: '2024-01-01T00:00:00Z',
        dismissed: false,
        period: '2024-01'
      }
    ];

    vi.mocked(alertService.getAlerts).mockResolvedValue({
      alerts: mockAlerts,
      unreadCount: 1
    });

    render(<AlertBanner />);

    await waitFor(() => {
      expect(screen.getByText('Budget Warning!')).toBeInTheDocument();
    });

    expect(screen.getByText('1 Alert')).toBeInTheDocument();
    expect(screen.getByText(/\$1000\.00/)).toBeInTheDocument();
    expect(screen.getByText(/\$850\.00/)).toBeInTheDocument();
    expect(screen.getByText(/85\.0%/)).toBeInTheDocument();
  });

  it('should display critical alert with correct styling', async () => {
    const mockAlerts: Alert[] = [
      {
        id: '2',
        userId: 'user1',
        type: 'CRITICAL',
        budgetAmount: 1000,
        currentSpending: 1100,
        percentageExceeded: 110,
        createdAt: '2024-01-01T00:00:00Z',
        dismissed: false,
        period: '2024-01'
      }
    ];

    vi.mocked(alertService.getAlerts).mockResolvedValue({
      alerts: mockAlerts,
      unreadCount: 1
    });

    render(<AlertBanner />);

    await waitFor(() => {
      expect(screen.getByText('Budget Exceeded!')).toBeInTheDocument();
    });

    expect(screen.getByText(/\$1100\.00/)).toBeInTheDocument();
  });

  it('should display multiple alerts with correct unread count', async () => {
    const mockAlerts: Alert[] = [
      {
        id: '1',
        userId: 'user1',
        type: 'WARNING',
        budgetAmount: 1000,
        currentSpending: 850,
        percentageExceeded: 85,
        createdAt: '2024-01-01T00:00:00Z',
        dismissed: false,
        period: '2024-01'
      },
      {
        id: '2',
        userId: 'user1',
        type: 'CRITICAL',
        budgetAmount: 1000,
        currentSpending: 1100,
        percentageExceeded: 110,
        createdAt: '2024-01-02T00:00:00Z',
        dismissed: false,
        period: '2024-01'
      }
    ];

    vi.mocked(alertService.getAlerts).mockResolvedValue({
      alerts: mockAlerts,
      unreadCount: 2
    });

    render(<AlertBanner />);

    await waitFor(() => {
      expect(screen.getByText('2 Alerts')).toBeInTheDocument();
    });

    expect(screen.getByText('Budget Warning!')).toBeInTheDocument();
    expect(screen.getByText('Budget Exceeded!')).toBeInTheDocument();
  });

  it('should dismiss alert when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    const mockAlerts: Alert[] = [
      {
        id: '1',
        userId: 'user1',
        type: 'WARNING',
        budgetAmount: 1000,
        currentSpending: 850,
        percentageExceeded: 85,
        createdAt: '2024-01-01T00:00:00Z',
        dismissed: false,
        period: '2024-01'
      }
    ];

    vi.mocked(alertService.getAlerts).mockResolvedValue({
      alerts: mockAlerts,
      unreadCount: 1
    });

    vi.mocked(alertService.dismissAlert).mockResolvedValue({ success: true });

    render(<AlertBanner />);

    await waitFor(() => {
      expect(screen.getByText('Budget Warning!')).toBeInTheDocument();
    });

    const dismissButton = screen.getByText('Dismiss');
    await user.click(dismissButton);

    await waitFor(() => {
      expect(alertService.dismissAlert).toHaveBeenCalledWith('1');
      expect(screen.queryByText('Budget Warning!')).not.toBeInTheDocument();
    });
  });

  it('should not render anything when there are no alerts', async () => {
    vi.mocked(alertService.getAlerts).mockResolvedValue({
      alerts: [],
      unreadCount: 0
    });

    const { container } = render(<AlertBanner />);

    await waitFor(() => {
      expect(alertService.getAlerts).toHaveBeenCalled();
    });

    expect(container.firstChild).toBeNull();
  });

  it('should filter out dismissed alerts from display', async () => {
    const mockAlerts: Alert[] = [
      {
        id: '1',
        userId: 'user1',
        type: 'WARNING',
        budgetAmount: 1000,
        currentSpending: 850,
        percentageExceeded: 85,
        createdAt: '2024-01-01T00:00:00Z',
        dismissed: false,
        period: '2024-01'
      },
      {
        id: '2',
        userId: 'user1',
        type: 'CRITICAL',
        budgetAmount: 1000,
        currentSpending: 1100,
        percentageExceeded: 110,
        createdAt: '2024-01-02T00:00:00Z',
        dismissed: true,
        period: '2024-01'
      }
    ];

    vi.mocked(alertService.getAlerts).mockResolvedValue({
      alerts: mockAlerts,
      unreadCount: 1
    });

    render(<AlertBanner />);

    await waitFor(() => {
      expect(screen.getByText('Budget Warning!')).toBeInTheDocument();
    });

    expect(screen.queryByText('Budget Exceeded!')).not.toBeInTheDocument();
  });

  it('should update unread count after dismissing an alert', async () => {
    const user = userEvent.setup();
    const mockAlerts: Alert[] = [
      {
        id: '1',
        userId: 'user1',
        type: 'WARNING',
        budgetAmount: 1000,
        currentSpending: 850,
        percentageExceeded: 85,
        createdAt: '2024-01-01T00:00:00Z',
        dismissed: false,
        period: '2024-01'
      }
    ];

    vi.mocked(alertService.getAlerts).mockResolvedValue({
      alerts: mockAlerts,
      unreadCount: 1
    });

    vi.mocked(alertService.dismissAlert).mockResolvedValue({ success: true });

    render(<AlertBanner />);

    await waitFor(() => {
      expect(screen.getByText('1 Alert')).toBeInTheDocument();
    });

    const dismissButton = screen.getByText('Dismiss');
    await user.click(dismissButton);

    await waitFor(() => {
      expect(screen.queryByText('1 Alert')).not.toBeInTheDocument();
    });
  });

  it('should display error message when fetching alerts fails', async () => {
    vi.mocked(alertService.getAlerts).mockRejectedValue(new Error('Network error'));

    render(<AlertBanner />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load alerts. Please try again.')).toBeInTheDocument();
    });
  });
});
