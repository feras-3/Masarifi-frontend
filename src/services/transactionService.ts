import apiClient from './apiClient';
import { Transaction, TransactionRequest, TransactionListResponse, CategoryTotal } from '../types/transaction';

export const transactionService = {
  // Create a new transaction
  createTransaction: async (data: TransactionRequest): Promise<Transaction> => {
    const response = await apiClient.post<Transaction>('/api/transactions', data);
    return response.data;
  },

  // Get all transactions
  getAllTransactions: async (): Promise<TransactionListResponse> => {
    const response = await apiClient.get<TransactionListResponse>('/api/transactions');
    return response.data;
  },

  // Update a transaction
  updateTransaction: async (id: string, data: TransactionRequest): Promise<Transaction> => {
    const response = await apiClient.put<Transaction>(`/api/transactions/${id}`, data);
    return response.data;
  },

  // Delete a transaction
  deleteTransaction: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/transactions/${id}`);
  },

  // Get totals by category
  getTotalsByCategory: async (): Promise<CategoryTotal[]> => {
    const response = await apiClient.get<{ categoryTotals: CategoryTotal[] }>('/api/transactions/by-category');
    return response.data.categoryTotals;
  }
};
