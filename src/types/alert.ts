export interface Alert {
  id: string;
  userId: string;
  type: 'WARNING' | 'CRITICAL';
  budgetAmount: number;
  currentSpending: number;
  percentageExceeded: number;
  createdAt: string;
  dismissed: boolean;
  period: string;
}

export interface AlertsResponse {
  alerts: Alert[];
  unreadCount: number;
}

export interface DismissAlertResponse {
  success: boolean;
}
