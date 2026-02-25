export interface PlaidAccount {
  id: string;
  userId: string;
  itemId: string;
  institutionName: string;
  accountName?: string;
  accountMask?: string;
  linkedAt: string;
  lastSyncAt?: string;
  isActive: boolean;
}

export interface LinkTokenResponse {
  linkToken: string;
  expiration: string;
}

export interface ExchangeTokenRequest {
  publicToken: string;
}

export interface ExchangeTokenResponse {
  success: boolean;
  accountId: string;
  institutionName: string;
}

export interface TransactionSyncResult {
  success: boolean;
  newTransactionCount: number;
  updatedTransactionCount?: number;
  errors: string[];
  syncedAt: string;
}

export interface PlaidAccountsResponse {
  accounts: PlaidAccount[];
  linked: boolean;
}
