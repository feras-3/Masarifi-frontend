import apiClient from './apiClient';
import { Transaction, TransactionRequest, TransactionListResponse, CategoryTotal } from '../types/transaction';

export const transactionService = {
  // Create a new manual transaction
  // POST /api/transactions
  createTransaction: async (data: TransactionRequest): Promise<Transaction> => {
    const response = await apiClient.post<Transaction>('/api/transactions', data);
    return response.data;
  },

  // Get all transactions (manual + Plaid)
  // GET /api/transactions
  getAllTransactions: async (): Promise<Transaction[]> => {
    const response = await apiClient.get<TransactionListResponse>('/api/transactions');
    return response.data.transactions;
  },

  // Update a transaction
  // PUT /api/transactions/{id}
  updateTransaction: async (id: string, data: TransactionRequest): Promise<Transaction> => {
    const response = await apiClient.put<Transaction>(`/api/transactions/${id}`, data);
    return response.data;
  },

  // Delete a transaction
  // DELETE /api/transactions/{id}
  deleteTransaction: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/transactions/${id}`);
  },

  // Get totals by category
  // GET /api/transactions/by-category
  getTotalsByCategory: async (): Promise<CategoryTotal[]> => {
    const response = await apiClient.get<{ categoryTotals: CategoryTotal[] }>('/api/transactions/by-category');
    return response.data.categoryTotals;
  }
};
