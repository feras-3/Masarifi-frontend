import apiClient from './apiClient';
import { Budget, BudgetRequest, BudgetStatus } from '../types/budget';

export const budgetService = {
  // Create a new budget (category-specific or general)
  // POST /api/budgets
  createBudget: async (data: BudgetRequest): Promise<Budget> => {
    const response = await apiClient.post<Budget>('/api/budgets', data);
    return response.data;
  },

  // Get all current budgets with spending info
  // GET /api/budgets/current
  getCurrentBudgetStatus: async (): Promise<BudgetStatus[]> => {
    const response = await apiClient.get<BudgetStatus[]>('/api/budgets/current');
    return response.data;
  },

  // Get a specific budget by ID
  // GET /api/budgets/{id}
  getBudgetById: async (id: string): Promise<Budget> => {
    const response = await apiClient.get<Budget>(`/api/budgets/${id}`);
    return response.data;
  },

  // Update a budget amount
  // PUT /api/budgets/{id}
  updateBudget: async (id: string, amount: number): Promise<Budget> => {
    const response = await apiClient.put<Budget>(`/api/budgets/${id}`, { amount });
    return response.data;
  },

  // Delete a budget
  // DELETE /api/budgets/{id}
  deleteBudget: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/budgets/${id}`);
  }
};
