import apiClient from './apiClient';
import {
  LinkTokenResponse,
  ExchangeTokenRequest,
  ExchangeTokenResponse,
  TransactionSyncResult,
  PlaidAccountsResponse
} from '../types/plaid';

export const plaidService = {
  async createLinkToken(): Promise<LinkTokenResponse> {
    const response = await apiClient.post<LinkTokenResponse>('/api/plaid/link-token');
    return response.data;
  },

  async exchangePublicToken(publicToken: string): Promise<ExchangeTokenResponse> {
    const request: ExchangeTokenRequest = { publicToken };
    const response = await apiClient.post<ExchangeTokenResponse>('/api/plaid/exchange-token', request);
    return response.data;
  },

  async syncTransactions(): Promise<TransactionSyncResult> {
    const response = await apiClient.post<TransactionSyncResult>('/api/plaid/sync-transactions');
    return response.data;
  },

  async getLinkedAccounts(): Promise<PlaidAccountsResponse> {
    const response = await apiClient.get<PlaidAccountsResponse>('/api/plaid/accounts');
    return response.data;
  },

  async unlinkAccount(): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>('/api/plaid/unlink');
    return response.data;
  }
};

export default plaidService;
