# How Transaction Syncing Works

## Overview

Transaction syncing pulls your bank transactions from Plaid into the app automatically. Once synced, transactions appear in your transaction list and are factored into your budget calculations.

---

## Step-by-Step Flow

### 1. Link a Bank Account

Before syncing, you must link a bank account via the **Bank Integration** panel on the dashboard.

- Select a bank (or enter a custom institution ID)
- Click **Link Bank Account**
- The app calls `POST /api/plaid/public-token` with the institution ID to create a sandbox public token
- Then calls `POST /api/plaid/exchange-token` with that public token
- The backend exchanges it for a secure access token and stores it — your account is now linked

### 2. Trigger a Sync

Once a bank is linked, a **Sync Transactions** button appears.

- Click **🔄 Sync Transactions**
- The app calls `POST /api/plaid/sync-transactions`
- The backend fetches transactions from the last 30 days using the stored Plaid access token

### 3. What Happens on the Backend

When the sync endpoint is called:

1. Plaid returns raw transactions for the linked account
2. Pending transactions are skipped (only settled transactions are saved)
3. Each Plaid category is mapped to one of the app's 7 categories:

| Plaid Category | App Category   |
|----------------|----------------|
| Groceries      | Food           |
| Restaurants    | Food           |
| Gas            | Transportation |
| Parking        | Transportation |
| Movies & DVDs  | Entertainment  |
| Electric       | Utilities      |
| Pharmacy       | Healthcare     |
| Clothing       | Shopping       |

4. Transactions are saved with `source: "PLAID"` so you can tell them apart from manual entries
5. All budgets are automatically recalculated
6. Budget alerts are generated if any threshold is exceeded (80%, 100%, exceeded)

### 4. Result

The sync button shows one of two messages:
- **"No new transactions found."** — all transactions from the last 30 days were already imported
- **"Successfully imported N new transactions!"** — new transactions were added

The dashboard then refreshes automatically to show the updated transaction list and budget charts.

---

## Data Flow Diagram

```
User clicks "Sync Transactions"
        │
        ▼
POST /api/plaid/sync-transactions
        │
        ▼
Backend fetches from Plaid API
(last 30 days, skips pending)
        │
        ▼
Map Plaid categories → App categories
        │
        ▼
Save new transactions (source = PLAID)
        │
        ▼
Recalculate all budgets
        │
        ▼
Generate alerts if over budget
        │
        ▼
Return { success, newTransactionCount, errors }
        │
        ▼
Dashboard refreshes
```

---

## Synced vs Manual Transactions

| Field              | Manual Transaction | Plaid Transaction     |
|--------------------|--------------------|-----------------------|
| `source`           | `"MANUAL"`         | `"PLAID"`             |
| `plaidTransactionId` | not set          | set by Plaid          |
| `merchantName`     | not set            | e.g. "Shell"          |
| `plaidCategory`    | not set            | e.g. "Gas"            |

Both types appear in the transaction list and count toward budget calculations.

---

## Relevant Files

| File | Role |
|------|------|
| `src/components/PlaidLinkButton.tsx` | UI for linking a bank account |
| `src/components/SyncTransactionsButton.tsx` | UI for triggering a sync |
| `src/components/PlaidAccountStatus.tsx` | Shows active linked accounts |
| `src/services/plaidService.ts` | API calls for Plaid endpoints |
| `src/components/Dashboard.tsx` | Orchestrates the Bank Integration panel |

---

## API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/plaid/public-token` | Create sandbox public token |
| `POST` | `/api/plaid/exchange-token` | Exchange for access token (links bank) |
| `POST` | `/api/plaid/sync-transactions` | Fetch and save transactions from Plaid |
| `GET`  | `/api/plaid/accounts` | Get linked accounts |
| `DELETE` | `/api/plaid/unlink` | Deactivate linked account |
