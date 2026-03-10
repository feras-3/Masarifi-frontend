export type AlertType = 'BUDGET_80_PERCENT' | 'BUDGET_100_PERCENT' | 'BUDGET_EXCEEDED';

export interface Alert {
  id: string;
  userId?: string;
  type: AlertType;
  budgetAmount: number;
  currentSpending: number;
  percentageExceeded: number;
  period: string;
  createdAt: string;
  dismissed: boolean;
}

export interface DismissAlertResponse {
  id: string;
  dismissed: boolean;
}
