import apiClient from './apiClient';
import {
  LinkTokenResponse,
  ExchangeTokenRequest,
  ExchangeTokenResponse,
  TransactionSyncResult,
  PlaidAccountsResponse
} from '../types/plaid';

export const plaidService = {
  // Create a link token for Plaid Link
  // POST /api/plaid/link-token
  async createLinkToken(): Promise<LinkTokenResponse> {
    const response = await apiClient.post<LinkTokenResponse>('/api/plaid/link-token');
    return response.data;
  },

  // Create a public token (for sandbox testing)
  // POST /api/plaid/public-token
  async createPublicToken(institutionId: string): Promise<{ publicToken: string }> {
    const response = await apiClient.post<{ publicToken: string }>('/api/plaid/public-token', {
      institution_id: institutionId
    });
    return response.data;
  },

  // Exchange public token for access token
  // POST /api/plaid/exchange-token
  async exchangePublicToken(publicToken: string): Promise<ExchangeTokenResponse> {
    const request: ExchangeTokenRequest = { publicToken };
    const response = await apiClient.post<ExchangeTokenResponse>('/api/plaid/exchange-token', request);
    return response.data;
  },

  // Sync transactions from Plaid
  // POST /api/plaid/sync-transactions
  async syncTransactions(): Promise<TransactionSyncResult> {
    const response = await apiClient.post<TransactionSyncResult>('/api/plaid/sync-transactions');
    return response.data;
  },

  // Get linked accounts
  // GET /api/plaid/accounts
  async getLinkedAccounts(): Promise<PlaidAccountsResponse> {
    const response = await apiClient.get<PlaidAccountsResponse>('/api/plaid/accounts');
    return response.data;
  },

  // Unlink account
  // DELETE /api/plaid/unlink
  async unlinkAccount(): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>('/api/plaid/unlink');
    return response.data;
  }
};

export default plaidService;
