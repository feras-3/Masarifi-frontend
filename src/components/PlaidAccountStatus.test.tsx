import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlaidAccountStatus } from './PlaidAccountStatus';
import plaidService from '../services/plaidService';
import { PlaidAccount } from '../types/plaid';

// Mock the plaid service
vi.mock('../services/plaidService', () => ({
  default: {
    getLinkedAccounts: vi.fn(),
    unlinkAccount: vi.fn()
  }
}));

describe('PlaidAccountStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.confirm mock
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('displays loading state initially', () => {
    vi.mocked(plaidService.getLinkedAccounts).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<PlaidAccountStatus />);
    expect(screen.getByText(/loading account status/i)).toBeInTheDocument();
  });

  it('displays error message on fetch failure', async () => {
    vi.mocked(plaidService.getLinkedAccounts).mockRejectedValue(
      new Error('Network error')
    );

    render(<PlaidAccountStatus />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load linked accounts/i)).toBeInTheDocument();
    });
  });

  it('renders nothing when no accounts are linked', async () => {
    vi.mocked(plaidService.getLinkedAccounts).mockResolvedValue({
      accounts: [],
      linked: false
    });

    const { container } = render(<PlaidAccountStatus />);

    await waitFor(() => {
      expect(plaidService.getLinkedAccounts).toHaveBeenCalled();
    });

    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when linked is false even with accounts', async () => {
    const mockAccounts: PlaidAccount[] = [
      {
        id: '1',
        userId: 'user1',
        itemId: 'item1',
        institutionName: 'Chase Bank',
        accountName: 'Checking',
        accountMask: '1234',
        linkedAt: '2024-01-01T00:00:00Z',
        lastSyncAt: '2024-01-15T12:00:00Z',
        isActive: true
      }
    ];

    vi.mocked(plaidService.getLinkedAccounts).mockResolvedValue({
      accounts: mockAccounts,
      linked: false
    });

    const { container } = render(<PlaidAccountStatus />);

    await waitFor(() => {
      expect(plaidService.getLinkedAccounts).toHaveBeenCalled();
    });

    expect(container.firstChild).toBeNull();
  });

  it('displays linked account information with all fields', async () => {
    const mockAccounts: PlaidAccount[] = [
      {
        id: '1',
        userId: 'user1',
        itemId: 'item1',
        institutionName: 'Chase Bank',
        accountName: 'Checking Account',
        accountMask: '1234',
        linkedAt: '2024-01-01T00:00:00Z',
        lastSyncAt: '2024-01-15T12:00:00Z',
        isActive: true
      }
    ];

    vi.mocked(plaidService.getLinkedAccounts).mockResolvedValue({
      accounts: mockAccounts,
      linked: true
    });

    render(<PlaidAccountStatus />);

    await waitFor(() => {
      expect(screen.getByText(/linked bank accounts/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/chase bank/i)).toBeInTheDocument();
    expect(screen.getByText(/checking account/i)).toBeInTheDocument();
    expect(screen.getByText(/\*\*\*\*1234/)).toBeInTheDocument();
    expect(screen.getByText(/active/i)).toBeInTheDocument();
  });

  it('displays account without optional fields', async () => {
    const mockAccounts: PlaidAccount[] = [
      {
        id: '1',
        userId: 'user1',
        itemId: 'item1',
        institutionName: 'Bank of America',
        linkedAt: '2024-01-01T00:00:00Z',
        isActive: true
      }
    ];

    vi.mocked(plaidService.getLinkedAccounts).mockResolvedValue({
      accounts: mockAccounts,
      linked: true
    });

    render(<PlaidAccountStatus />);

    await waitFor(() => {
      expect(screen.getByText(/bank of america/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/account:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/account number:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/last sync:/i)).not.toBeInTheDocument();
  });

  it('displays inactive account status correctly', async () => {
    const mockAccounts: PlaidAccount[] = [
      {
        id: '1',
        userId: 'user1',
        itemId: 'item1',
        institutionName: 'Wells Fargo',
        accountMask: '5678',
        linkedAt: '2024-01-01T00:00:00Z',
        isActive: false
      }
    ];

    vi.mocked(plaidService.getLinkedAccounts).mockResolvedValue({
      accounts: mockAccounts,
      linked: true
    });

    render(<PlaidAccountStatus />);

    await waitFor(() => {
      expect(screen.getByText(/inactive/i)).toBeInTheDocument();
    });
  });

  it('displays multiple linked accounts', async () => {
    const mockAccounts: PlaidAccount[] = [
      {
        id: '1',
        userId: 'user1',
        itemId: 'item1',
        institutionName: 'Chase Bank',
        accountMask: '1234',
        linkedAt: '2024-01-01T00:00:00Z',
        isActive: true
      },
      {
        id: '2',
        userId: 'user1',
        itemId: 'item2',
        institutionName: 'Bank of America',
        accountMask: '5678',
        linkedAt: '2024-01-02T00:00:00Z',
        isActive: true
      }
    ];

    vi.mocked(plaidService.getLinkedAccounts).mockResolvedValue({
      accounts: mockAccounts,
      linked: true
    });

    render(<PlaidAccountStatus />);

    await waitFor(() => {
      expect(screen.getByText(/chase bank/i)).toBeInTheDocument();
      expect(screen.getByText(/bank of america/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/\*\*\*\*1234/)).toBeInTheDocument();
    expect(screen.getByText(/\*\*\*\*5678/)).toBeInTheDocument();
  });

  it('formats linked date correctly', async () => {
    const mockAccounts: PlaidAccount[] = [
      {
        id: '1',
        userId: 'user1',
        itemId: 'item1',
        institutionName: 'Chase Bank',
        linkedAt: '2024-01-15T10:30:00Z',
        isActive: true
      }
    ];

    vi.mocked(plaidService.getLinkedAccounts).mockResolvedValue({
      accounts: mockAccounts,
      linked: true
    });

    render(<PlaidAccountStatus />);

    await waitFor(() => {
      const linkedDate = new Date('2024-01-15T10:30:00Z').toLocaleDateString();
      expect(screen.getByText(new RegExp(linkedDate))).toBeInTheDocument();
    });
  });

  it('formats last sync timestamp correctly', async () => {
    const mockAccounts: PlaidAccount[] = [
      {
        id: '1',
        userId: 'user1',
        itemId: 'item1',
        institutionName: 'Chase Bank',
        linkedAt: '2024-01-01T00:00:00Z',
        lastSyncAt: '2024-01-15T14:30:00Z',
        isActive: true
      }
    ];

    vi.mocked(plaidService.getLinkedAccounts).mockResolvedValue({
      accounts: mockAccounts,
      linked: true
    });

    render(<PlaidAccountStatus />);

    await waitFor(() => {
      const syncDate = new Date('2024-01-15T14:30:00Z').toLocaleString();
      expect(screen.getByText(new RegExp(syncDate))).toBeInTheDocument();
    });
  });

  it('calls unlinkAccount when unlink button is clicked and confirmed', async () => {
    const user = userEvent.setup();
    const mockAccounts: PlaidAccount[] = [
      {
        id: '1',
        userId: 'user1',
        itemId: 'item1',
        institutionName: 'Chase Bank',
        linkedAt: '2024-01-01T00:00:00Z',
        isActive: true
      }
    ];

    vi.mocked(plaidService.getLinkedAccounts)
      .mockResolvedValueOnce({
        accounts: mockAccounts,
        linked: true
      })
      .mockResolvedValueOnce({
        accounts: [],
        linked: false
      });

    vi.mocked(plaidService.unlinkAccount).mockResolvedValue({ success: true });

    render(<PlaidAccountStatus />);

    await waitFor(() => {
      expect(screen.getByText(/chase bank/i)).toBeInTheDocument();
    });

    const unlinkButton = screen.getByText(/unlink account/i);
    await user.click(unlinkButton);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringContaining('Are you sure you want to unlink your bank account?')
      );
      expect(plaidService.unlinkAccount).toHaveBeenCalled();
    });
  });

  it('does not call unlinkAccount when user cancels confirmation', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    const mockAccounts: PlaidAccount[] = [
      {
        id: '1',
        userId: 'user1',
        itemId: 'item1',
        institutionName: 'Chase Bank',
        linkedAt: '2024-01-01T00:00:00Z',
        isActive: true
      }
    ];

    vi.mocked(plaidService.getLinkedAccounts).mockResolvedValue({
      accounts: mockAccounts,
      linked: true
    });

    render(<PlaidAccountStatus />);

    await waitFor(() => {
      expect(screen.getByText(/chase bank/i)).toBeInTheDocument();
    });

    const unlinkButton = screen.getByText(/unlink account/i);
    await user.click(unlinkButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(plaidService.unlinkAccount).not.toHaveBeenCalled();
  });

  it('displays error message when unlinking fails', async () => {
    const user = userEvent.setup();
    const mockAccounts: PlaidAccount[] = [
      {
        id: '1',
        userId: 'user1',
        itemId: 'item1',
        institutionName: 'Chase Bank',
        linkedAt: '2024-01-01T00:00:00Z',
        isActive: true
      }
    ];

    vi.mocked(plaidService.getLinkedAccounts).mockResolvedValue({
      accounts: mockAccounts,
      linked: true
    });

    vi.mocked(plaidService.unlinkAccount).mockRejectedValue(
      new Error('Unlink failed')
    );

    render(<PlaidAccountStatus />);

    await waitFor(() => {
      expect(screen.getByText(/chase bank/i)).toBeInTheDocument();
    });

    const unlinkButton = screen.getByText(/unlink account/i);
    await user.click(unlinkButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to unlink account/i)).toBeInTheDocument();
    });
  });

  it('disables unlink button while unlinking is in progress', async () => {
    const user = userEvent.setup();
    const mockAccounts: PlaidAccount[] = [
      {
        id: '1',
        userId: 'user1',
        itemId: 'item1',
        institutionName: 'Chase Bank',
        linkedAt: '2024-01-01T00:00:00Z',
        isActive: true
      }
    ];

    vi.mocked(plaidService.getLinkedAccounts).mockResolvedValue({
      accounts: mockAccounts,
      linked: true
    });

    vi.mocked(plaidService.unlinkAccount).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
    );

    render(<PlaidAccountStatus />);

    await waitFor(() => {
      expect(screen.getByText(/chase bank/i)).toBeInTheDocument();
    });

    const unlinkButton = screen.getByText(/unlink account/i) as HTMLButtonElement;
    await user.click(unlinkButton);

    // Button should show "Unlinking..." and be disabled
    await waitFor(() => {
      expect(screen.getByText(/unlinking\.\.\./i)).toBeInTheDocument();
    });

    const unlinkingButton = screen.getByText(/unlinking\.\.\./i) as HTMLButtonElement;
    expect(unlinkingButton.disabled).toBe(true);
  });

  it('calls onUnlink callback after successful unlink', async () => {
    const user = userEvent.setup();
    const onUnlinkMock = vi.fn();
    const mockAccounts: PlaidAccount[] = [
      {
        id: '1',
        userId: 'user1',
        itemId: 'item1',
        institutionName: 'Chase Bank',
        linkedAt: '2024-01-01T00:00:00Z',
        isActive: true
      }
    ];

    vi.mocked(plaidService.getLinkedAccounts)
      .mockResolvedValueOnce({
        accounts: mockAccounts,
        linked: true
      })
      .mockResolvedValueOnce({
        accounts: [],
        linked: false
      });

    vi.mocked(plaidService.unlinkAccount).mockResolvedValue({ success: true });

    render(<PlaidAccountStatus onUnlink={onUnlinkMock} />);

    await waitFor(() => {
      expect(screen.getByText(/chase bank/i)).toBeInTheDocument();
    });

    const unlinkButton = screen.getByText(/unlink account/i);
    await user.click(unlinkButton);

    await waitFor(() => {
      expect(onUnlinkMock).toHaveBeenCalled();
    });
  });

  it('refetches accounts when refreshTrigger changes', async () => {
    const mockAccounts: PlaidAccount[] = [
      {
        id: '1',
        userId: 'user1',
        itemId: 'item1',
        institutionName: 'Chase Bank',
        linkedAt: '2024-01-01T00:00:00Z',
        isActive: true
      }
    ];

    vi.mocked(plaidService.getLinkedAccounts).mockResolvedValue({
      accounts: mockAccounts,
      linked: true
    });

    const { rerender } = render(<PlaidAccountStatus refreshTrigger={0} />);

    await waitFor(() => {
      expect(plaidService.getLinkedAccounts).toHaveBeenCalledTimes(1);
    });

    rerender(<PlaidAccountStatus refreshTrigger={1} />);

    await waitFor(() => {
      expect(plaidService.getLinkedAccounts).toHaveBeenCalledTimes(2);
    });
  });
});
