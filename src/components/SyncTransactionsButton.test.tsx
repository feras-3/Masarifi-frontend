import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SyncTransactionsButton from './SyncTransactionsButton';
import plaidService from '../services/plaidService';

// Mock the plaid service
vi.mock('../services/plaidService', () => ({
  default: {
    syncTransactions: vi.fn(),
  },
}));

describe('SyncTransactionsButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sync button', () => {
    render(<SyncTransactionsButton />);
    expect(screen.getByText('🔄 Sync Transactions')).toBeInTheDocument();
    expect(screen.getByText(/Click to manually sync transactions/)).toBeInTheDocument();
  });

  it('displays loading state during sync', async () => {
    // Mock a delayed response
    vi.mocked(plaidService.syncTransactions).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        success: true,
        newTransactionCount: 5,
        errors: [],
        syncedAt: new Date().toISOString()
      }), 100))
    );

    render(<SyncTransactionsButton />);

    const button = screen.getByText('🔄 Sync Transactions');
    await userEvent.click(button);

    // Should show loading spinner
    expect(screen.getByText('Syncing transactions...')).toBeInTheDocument();
    expect(screen.queryByText('🔄 Sync Transactions')).not.toBeInTheDocument();

    // Wait for sync to complete
    await waitFor(() => {
      expect(screen.queryByText('Syncing transactions...')).not.toBeInTheDocument();
    });
  });

  it('displays count of newly imported transactions on success', async () => {
    vi.mocked(plaidService.syncTransactions).mockResolvedValue({
      success: true,
      newTransactionCount: 5,
      errors: [],
      syncedAt: new Date().toISOString()
    });

    render(<SyncTransactionsButton />);

    const button = screen.getByText('🔄 Sync Transactions');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Successfully imported 5 new transactions!/)).toBeInTheDocument();
    });
  });

  it('displays singular message for one transaction', async () => {
    vi.mocked(plaidService.syncTransactions).mockResolvedValue({
      success: true,
      newTransactionCount: 1,
      errors: [],
      syncedAt: new Date().toISOString()
    });

    render(<SyncTransactionsButton />);

    const button = screen.getByText('🔄 Sync Transactions');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Successfully imported 1 new transaction!/)).toBeInTheDocument();
    });
  });

  it('displays message when no new transactions found', async () => {
    vi.mocked(plaidService.syncTransactions).mockResolvedValue({
      success: true,
      newTransactionCount: 0,
      errors: [],
      syncedAt: new Date().toISOString()
    });

    render(<SyncTransactionsButton />);

    const button = screen.getByText('🔄 Sync Transactions');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/No new transactions found\./)).toBeInTheDocument();
    });
  });

  it('displays error message when sync fails with errors array', async () => {
    vi.mocked(plaidService.syncTransactions).mockResolvedValue({
      success: false,
      newTransactionCount: 0,
      errors: ['Failed to fetch transactions from 1 account', 'Network timeout'],
      syncedAt: new Date().toISOString()
    });

    render(<SyncTransactionsButton />);

    const button = screen.getByText('🔄 Sync Transactions');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch transactions from 1 account, Network timeout/)).toBeInTheDocument();
    });
  });

  it('displays generic error message when sync fails without specific errors', async () => {
    vi.mocked(plaidService.syncTransactions).mockResolvedValue({
      success: false,
      newTransactionCount: 0,
      errors: [],
      syncedAt: new Date().toISOString()
    });

    render(<SyncTransactionsButton />);

    const button = screen.getByText('🔄 Sync Transactions');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Transaction sync failed. Please try again.')).toBeInTheDocument();
    });
  });

  it('displays error message when API call throws exception', async () => {
    vi.mocked(plaidService.syncTransactions).mockRejectedValue({
      response: {
        data: {
          message: 'Access token is invalid. Please re-link your account.'
        }
      }
    });

    render(<SyncTransactionsButton />);

    const button = screen.getByText('🔄 Sync Transactions');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Access token is invalid. Please re-link your account.')).toBeInTheDocument();
    });
  });

  it('displays generic error when API call throws exception without message', async () => {
    vi.mocked(plaidService.syncTransactions).mockRejectedValue(new Error('Network error'));

    render(<SyncTransactionsButton />);

    const button = screen.getByText('🔄 Sync Transactions');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Failed to sync transactions. Please try again.')).toBeInTheDocument();
    });
  });

  it('calls onSyncComplete callback with transaction count on success', async () => {
    vi.mocked(plaidService.syncTransactions).mockResolvedValue({
      success: true,
      newTransactionCount: 7,
      errors: [],
      syncedAt: new Date().toISOString()
    });

    const onSyncComplete = vi.fn();
    render(<SyncTransactionsButton onSyncComplete={onSyncComplete} />);

    const button = screen.getByText('🔄 Sync Transactions');
    await userEvent.click(button);

    await waitFor(() => {
      expect(onSyncComplete).toHaveBeenCalledWith(7);
    });
  });

  it('does not call onSyncComplete callback on failure', async () => {
    vi.mocked(plaidService.syncTransactions).mockResolvedValue({
      success: false,
      newTransactionCount: 0,
      errors: ['Sync failed'],
      syncedAt: new Date().toISOString()
    });

    const onSyncComplete = vi.fn();
    render(<SyncTransactionsButton onSyncComplete={onSyncComplete} />);

    const button = screen.getByText('🔄 Sync Transactions');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Sync failed/)).toBeInTheDocument();
    });

    expect(onSyncComplete).not.toHaveBeenCalled();
  });

  it('clears success message after 5 seconds', async () => {
    vi.mocked(plaidService.syncTransactions).mockResolvedValue({
      success: true,
      newTransactionCount: 3,
      errors: [],
      syncedAt: new Date().toISOString()
    });

    const { rerender } = render(<SyncTransactionsButton />);

    const button = screen.getByText('🔄 Sync Transactions');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Successfully imported 3 new transactions!/)).toBeInTheDocument();
    });

    // Wait for the timeout to clear the message (5 seconds + buffer)
    await new Promise(resolve => setTimeout(resolve, 5100));

    // Force a re-render to check if message is gone
    rerender(<SyncTransactionsButton />);

    expect(screen.queryByText(/Successfully imported 3 new transactions!/)).not.toBeInTheDocument();
  }, 10000);

  it('disables button during sync', async () => {
    let resolveSync: any;
    vi.mocked(plaidService.syncTransactions).mockImplementation(
      () => new Promise(resolve => {
        resolveSync = resolve;
      })
    );

    render(<SyncTransactionsButton />);

    const button = screen.getByText('🔄 Sync Transactions');
    await userEvent.click(button);

    // Button should be replaced by loading spinner
    await waitFor(() => {
      expect(screen.queryByText('🔄 Sync Transactions')).not.toBeInTheDocument();
      expect(screen.getByText('Syncing transactions...')).toBeInTheDocument();
    });

    // Resolve the sync
    resolveSync({
      success: true,
      newTransactionCount: 2,
      errors: [],
      syncedAt: new Date().toISOString()
    });

    await waitFor(() => {
      expect(screen.getByText('🔄 Sync Transactions')).toBeInTheDocument();
    });
  });
});
