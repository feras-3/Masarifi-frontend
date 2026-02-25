import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlaidLinkButton from './PlaidLinkButton';
import plaidService from '../services/plaidService';
import { usePlaidLink } from 'react-plaid-link';

// Mock the plaid service
vi.mock('../services/plaidService', () => ({
  default: {
    createLinkToken: vi.fn(),
    exchangePublicToken: vi.fn(),
  },
}));

// Mock the react-plaid-link hook
vi.mock('react-plaid-link', () => ({
  usePlaidLink: vi.fn(),
}));

describe('PlaidLinkButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders link button', () => {
    vi.mocked(usePlaidLink).mockReturnValue({
      open: vi.fn(),
      ready: true,
      error: null,
      submit: vi.fn(),
      exit: vi.fn(),
    });

    render(<PlaidLinkButton />);
    expect(screen.getByText('Link Bank Account')).toBeInTheDocument();
  });

  it('fetches link token and opens Plaid Link on click', async () => {
    const mockLinkToken = {
      linkToken: 'link-sandbox-test-token',
      expiration: '2024-01-01T00:00:00Z'
    };

    vi.mocked(plaidService.createLinkToken).mockResolvedValue(mockLinkToken);
    vi.mocked(plaidService.exchangePublicToken).mockResolvedValue({
      success: true,
      accountId: 'account-123',
      institutionName: 'Test Bank'
    });

    const mockOpen = vi.fn();
    
    vi.mocked(usePlaidLink).mockImplementation((config: any) => {
      // Store the config so we can call onSuccess later
      mockOpen.mockImplementation(() => {
        if (config.onSuccess) {
          config.onSuccess('test-public-token', {});
        }
      });
      
      return {
        open: mockOpen,
        ready: true,
        error: null,
        submit: vi.fn(),
        exit: vi.fn(),
      };
    });

    const onSuccess = vi.fn();
    render(<PlaidLinkButton onSuccess={onSuccess} />);

    const button = screen.getByText('Link Bank Account');
    await userEvent.click(button);

    await waitFor(() => {
      expect(plaidService.createLinkToken).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(plaidService.exchangePublicToken).toHaveBeenCalledWith('test-public-token');
    });

    await waitFor(() => {
      expect(screen.getByText(/Successfully linked Test Bank/)).toBeInTheDocument();
      expect(onSuccess).toHaveBeenCalledWith('Test Bank');
    });
  });

  it('displays error when link token fetch fails', async () => {
    vi.mocked(plaidService.createLinkToken).mockRejectedValue({
      response: {
        data: {
          error: 'Service Error',
          message: 'Unable to initialize bank linking'
        }
      }
    });

    vi.mocked(usePlaidLink).mockReturnValue({
      open: vi.fn(),
      ready: true,
      error: null,
      submit: vi.fn(),
      exit: vi.fn(),
    });

    render(<PlaidLinkButton />);

    const button = screen.getByText('Link Bank Account');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Unable to initialize bank linking')).toBeInTheDocument();
    });
  });

  it('displays error when token exchange fails', async () => {
    const mockLinkToken = {
      linkToken: 'link-sandbox-test-token',
      expiration: '2024-01-01T00:00:00Z'
    };

    vi.mocked(plaidService.createLinkToken).mockResolvedValue(mockLinkToken);
    vi.mocked(plaidService.exchangePublicToken).mockRejectedValue({
      response: {
        data: {
          error: 'Exchange Error',
          message: 'Failed to exchange token'
        }
      }
    });

    const mockOpen = vi.fn();
    
    vi.mocked(usePlaidLink).mockImplementation((config: any) => {
      // Store the config so we can call onSuccess later
      mockOpen.mockImplementation(() => {
        if (config.onSuccess) {
          // Call onSuccess which will trigger exchangePublicToken
          config.onSuccess('test-public-token', {});
        }
      });
      
      return {
        open: mockOpen,
        ready: true,
        error: null,
        submit: vi.fn(),
        exit: vi.fn(),
      };
    });

    render(<PlaidLinkButton />);

    const button = screen.getByText('Link Bank Account');
    await userEvent.click(button);

    // Wait for link token to be fetched
    await waitFor(() => {
      expect(plaidService.createLinkToken).toHaveBeenCalled();
    });

    // Wait for the error message to appear after exchange fails
    await waitFor(() => {
      expect(screen.getByText('Failed to exchange token')).toBeInTheDocument();
    });

    // Verify exchangePublicToken was called
    expect(plaidService.exchangePublicToken).toHaveBeenCalledWith('test-public-token');
  });

  it('calls onExit callback when user exits Plaid Link', async () => {
    const mockLinkToken = {
      linkToken: 'link-sandbox-test-token',
      expiration: '2024-01-01T00:00:00Z'
    };

    vi.mocked(plaidService.createLinkToken).mockResolvedValue(mockLinkToken);

    const mockOpen = vi.fn();
    
    vi.mocked(usePlaidLink).mockImplementation((config: any) => {
      mockOpen.mockImplementation(() => {
        if (config.onExit) {
          config.onExit();
        }
      });
      
      return {
        open: mockOpen,
        ready: true,
        error: null,
        submit: vi.fn(),
        exit: vi.fn(),
      };
    });

    const onExit = vi.fn();
    render(<PlaidLinkButton onExit={onExit} />);

    const button = screen.getByText('Link Bank Account');
    await userEvent.click(button);

    await waitFor(() => {
      expect(onExit).toHaveBeenCalled();
    });
  });
});
