export interface Budget {
  id: string;
  userId: string;
  amount: number;
  period: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetRequest {
  amount: number;
  period: string;
}

export interface BudgetStatus {
  budgetId: string;
  amount: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  period: string;
}

export interface BudgetValidationErrors {
  amount?: string;
  period?: string;
}
