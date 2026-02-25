import apiClient from './apiClient';
import { Budget, BudgetRequest, BudgetStatus } from '../types/budget';

export const budgetService = {
  // Create a new budget
  createBudget: async (data: BudgetRequest): Promise<Budget> => {
    const response = await apiClient.post<Budget>('/api/budgets', data);
    return response.data;
  },

  // Get current budget status
  getCurrentBudgetStatus: async (): Promise<BudgetStatus> => {
    const response = await apiClient.get<BudgetStatus>('/api/budgets/current');
    return response.data;
  },

  // Update a budget
  updateBudget: async (id: string, amount: number): Promise<Budget> => {
    const response = await apiClient.put<Budget>(`/api/budgets/${id}`, { amount });
    return response.data;
  }
};
