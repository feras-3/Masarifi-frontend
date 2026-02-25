export enum Category {
  FOOD = 'Food',
  TRANSPORTATION = 'Transportation',
  ENTERTAINMENT = 'Entertainment',
  UTILITIES = 'Utilities',
  HEALTHCARE = 'Healthcare',
  SHOPPING = 'Shopping',
  OTHER = 'Other'
}

export type TransactionSource = 'MANUAL' | 'PLAID';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  date: string; // ISO 8601 format
  description: string;
  category: Category;
  createdAt: string; // ISO 8601 format
  plaidTransactionId?: string;
  merchantName?: string;
  plaidCategory?: string;
  source: TransactionSource;
}

export interface TransactionRequest {
  amount: number;
  date: string;
  description: string;
  category: Category;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
}

export interface CategoryTotal {
  category: string;
  total: number;
}

export interface ValidationErrors {
  amount?: string;
  date?: string;
  description?: string;
  category?: string;
}
