export interface Budget {
  id: string;
  userId: string;
  amount: number;
  period: string;
  category?: string; // Optional - if not provided, it's a general budget
  createdAt: string;
  updatedAt: string;
}

export interface BudgetRequest {
  amount: number;
  period: string; // "MONTHLY" or "YYYY-MM" format
  category?: string; // Optional - omit for general budget
}

export interface BudgetStatus {
  budgetId: string;
  amount: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  period: string;
  category?: string; // Optional - present for category-specific budgets
}

export interface BudgetValidationErrors {
  amount?: string;
  period?: string;
}
