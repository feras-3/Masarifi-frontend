# TypeScript Frontend API Integration Guide

This guide shows how to use the TypeScript services to call the backend API endpoints documented in `API_USAGE_GUIDE.md`.

## Configuration

Set your API base URL in `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Available Services

All services are located in `src/services/` and are fully typed with TypeScript.

---

## 1. Authentication Service

### Register a New User

```typescript
import { authService } from '../services/authService'

const handleRegister = async () => {
  try {
    const response = await authService.register({
      username: 'testuser',
      password: 'password123'
    })

    console.log('Token:', response.token)
    console.log('Username:', response.username)

    // Store token and username
    localStorage.setItem('auth_token', response.token)
    localStorage.setItem('username', response.username)
  } catch (error) {
    console.error('Registration failed:', error)
  }
}
```

### Login

```typescript
import { authService } from '../services/authService'

const handleLogin = async () => {
  try {
    const response = await authService.login({
      username: 'testuser',
      password: 'password123'
    })

    console.log('Token:', response.token)
    console.log('Username:', response.username)

    // Token is automatically stored by apiClient interceptor
  } catch (error) {
    console.error('Login failed:', error)
  }
}
```

---

## 2. Budget Service

### Create a Category-Specific Budget

```typescript
import { budgetService } from '../services/budgetService'

const createFoodBudget = async () => {
  try {
    const budget = await budgetService.createBudget({
      amount: 500.0,
      period: 'MONTHLY', // or '2026-03'
      category: 'Food'
    })

    console.log('Budget created:', budget)
  } catch (error) {
    console.error('Failed to create budget:', error)
  }
}
```

### Create a General Budget (All Categories)

```typescript
const createGeneralBudget = async () => {
  try {
    const budget = await budgetService.createBudget({
      amount: 2000.0,
      period: 'MONTHLY'
      // No category = general budget
    })

    console.log('General budget created:', budget)
  } catch (error) {
    console.error('Failed to create budget:', error)
  }
}
```

### Get All Current Budgets

```typescript
const fetchBudgets = async () => {
  try {
    const budgets = await budgetService.getCurrentBudgetStatus()

    budgets.forEach((budget) => {
      console.log(`${budget.category || 'General'} Budget:`)
      console.log(`  Amount: $${budget.amount}`)
      console.log(`  Spent: $${budget.spent}`)
      console.log(`  Remaining: $${budget.remaining}`)
      console.log(`  Usage: ${budget.percentageUsed}%`)
    })
  } catch (error) {
    console.error('Failed to fetch budgets:', error)
  }
}
```

### Get Specific Budget by ID

```typescript
const fetchBudgetById = async (budgetId: string) => {
  try {
    const budget = await budgetService.getBudgetById(budgetId)
    console.log('Budget:', budget)
  } catch (error) {
    console.error('Failed to fetch budget:', error)
  }
}
```

### Update Budget Amount

```typescript
const updateBudget = async (budgetId: string) => {
  try {
    const updated = await budgetService.updateBudget(budgetId, 600.0)
    console.log('Budget updated:', updated)
  } catch (error) {
    console.error('Failed to update budget:', error)
  }
}
```

---

## 3. Transaction Service

### Create a Manual Transaction

```typescript
import { transactionService } from '../services/transactionService'
import { Category } from '../types/transaction'

const createTransaction = async () => {
  try {
    const transaction = await transactionService.createTransaction({
      amount: 50.0,
      category: Category.FOOD,
      description: 'Grocery shopping',
      date: '2026-03-08'
    })

    console.log('Transaction created:', transaction)
  } catch (error) {
    console.error('Failed to create transaction:', error)
  }
}
```

### Get All Transactions

```typescript
const fetchTransactions = async () => {
  try {
    const transactions = await transactionService.getAllTransactions()

    transactions.forEach((tx) => {
      console.log(
        `${tx.date}: ${tx.description} - $${tx.amount} (${tx.source})`
      )
    })
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
  }
}
```

### Update Transaction

```typescript
const updateTransaction = async (transactionId: string) => {
  try {
    const updated = await transactionService.updateTransaction(transactionId, {
      amount: 75.0,
      category: Category.FOOD,
      description: 'Updated grocery shopping',
      date: '2026-03-08'
    })

    console.log('Transaction updated:', updated)
  } catch (error) {
    console.error('Failed to update transaction:', error)
  }
}
```

### Delete Transaction

```typescript
const deleteTransaction = async (transactionId: string) => {
  try {
    await transactionService.deleteTransaction(transactionId)
    console.log('Transaction deleted')
  } catch (error) {
    console.error('Failed to delete transaction:', error)
  }
}
```

### Get Category Totals

```typescript
const fetchCategoryTotals = async () => {
  try {
    const totals = await transactionService.getTotalsByCategory()

    totals.forEach(({ category, total }) => {
      console.log(`${category}: $${total}`)
    })
  } catch (error) {
    console.error('Failed to fetch category totals:', error)
  }
}
```

---

## 4. Plaid Service

### Create Link Token (for Plaid Link UI)

```typescript
import { plaidService } from '../services/plaidService'

const initializePlaidLink = async () => {
  try {
    const { linkToken } = await plaidService.createLinkToken()
    console.log('Link token:', linkToken)
    // Use this token with react-plaid-link
  } catch (error) {
    console.error('Failed to create link token:', error)
  }
}
```

### Create Public Token (Sandbox Testing)

```typescript
const createSandboxToken = async () => {
  try {
    const { publicToken } = await plaidService.createPublicToken('ins_109508') // Chase
    console.log('Public token:', publicToken)
    return publicToken
  } catch (error) {
    console.error('Failed to create public token:', error)
  }
}
```

**Common Sandbox Institution IDs:**

- `ins_109508` - Chase
- `ins_109509` - Bank of America
- `ins_109510` - Wells Fargo

### Exchange Public Token

```typescript
const linkBankAccount = async (publicToken: string) => {
  try {
    const result = await plaidService.exchangePublicToken(publicToken)

    console.log('Success:', result.success)
    console.log('Account ID:', result.accountId)
    console.log('Institution:', result.institutionName)
  } catch (error) {
    console.error('Failed to exchange token:', error)
  }
}
```

### Sync Transactions

```typescript
const syncPlaidTransactions = async () => {
  try {
    const result = await plaidService.syncTransactions()

    console.log('Success:', result.success)
    console.log('New transactions:', result.newTransactionCount)
    console.log('Errors:', result.errors)
  } catch (error) {
    console.error('Failed to sync transactions:', error)
  }
}
```

### Get Linked Accounts

```typescript
const fetchLinkedAccounts = async () => {
  try {
    const { accounts, linked } = await plaidService.getLinkedAccounts()

    console.log('Has linked account:', linked)
    accounts.forEach((account) => {
      console.log(
        `${account.institutionName} - ${account.accountName} (${account.accountMask})`
      )
    })
  } catch (error) {
    console.error('Failed to fetch accounts:', error)
  }
}
```

### Unlink Account

```typescript
const unlinkAccount = async () => {
  try {
    const { success } = await plaidService.unlinkAccount()
    console.log('Unlinked:', success)
  } catch (error) {
    console.error('Failed to unlink account:', error)
  }
}
```

---

## 5. Alert Service

### Get All Alerts

```typescript
import { alertService } from '../services/alertService'

const fetchAlerts = async () => {
  try {
    const alerts = await alertService.getAlerts()

    alerts.forEach((alert) => {
      console.log(`Alert: ${alert.type}`)
      console.log(`  Budget: $${alert.budgetAmount}`)
      console.log(`  Current: $${alert.currentSpending}`)
      console.log(`  Exceeded: ${alert.percentageExceeded}%`)
      console.log(`  Dismissed: ${alert.dismissed}`)
    })
  } catch (error) {
    console.error('Failed to fetch alerts:', error)
  }
}
```

### Dismiss Alert

```typescript
const dismissAlert = async (alertId: string) => {
  try {
    const result = await alertService.dismissAlert(alertId)
    console.log('Alert dismissed:', result.dismissed)
  } catch (error) {
    console.error('Failed to dismiss alert:', error)
  }
}
```

---

## Complete Example: Full Workflow

```typescript
import { authService } from '../services/authService'
import { budgetService } from '../services/budgetService'
import { transactionService } from '../services/transactionService'
import { plaidService } from '../services/plaidService'
import { alertService } from '../services/alertService'
import { Category } from '../types/transaction'

const completeWorkflow = async () => {
  try {
    // 1. Register/Login
    const auth = await authService.register({
      username: 'newuser',
      password: 'password123'
    })
    console.log('Logged in as:', auth.username)

    // 2. Create budgets
    await budgetService.createBudget({
      amount: 500,
      period: 'MONTHLY',
      category: 'Food'
    })

    await budgetService.createBudget({
      amount: 300,
      period: 'MONTHLY',
      category: 'Transportation'
    })

    // 3. Add a transaction
    await transactionService.createTransaction({
      amount: 50,
      category: Category.FOOD,
      description: 'Groceries',
      date: new Date().toISOString().split('T')[0]
    })

    // 4. Check budget status
    const budgets = await budgetService.getCurrentBudgetStatus()
    console.log('Budgets:', budgets)

    // 5. Link Plaid account (sandbox)
    const { publicToken } = await plaidService.createPublicToken('ins_109508')
    await plaidService.exchangePublicToken(publicToken)

    // 6. Sync transactions
    const syncResult = await plaidService.syncTransactions()
    console.log(`Synced ${syncResult.newTransactionCount} transactions`)

    // 7. Check for alerts
    const alerts = await alertService.getAlerts()
    console.log(`You have ${alerts.length} alerts`)
  } catch (error) {
    console.error('Workflow error:', error)
  }
}
```

---

## Error Handling

All services throw errors that can be caught and handled:

```typescript
try {
  const result = await budgetService.createBudget(data)
} catch (error: any) {
  if (error.response) {
    // Server responded with error
    console.error('Status:', error.response.status)
    console.error('Message:', error.response.data.message)
  } else if (error.request) {
    // Network error
    console.error('Network error - check your connection')
  } else {
    // Other error
    console.error('Error:', error.message)
  }
}
```

---

## Automatic Features

### JWT Token Management

The `apiClient` automatically:

- Adds `Authorization: Bearer <token>` header to all requests
- Stores token in localStorage
- Redirects to `/login` on 401 (unauthorized) responses

### Type Safety

All services are fully typed:

- Request parameters are validated at compile time
- Response types are known and autocompleted
- Catch errors early with TypeScript

---

## Valid Categories

```typescript
export enum Category {
  FOOD = 'Food',
  TRANSPORTATION = 'Transportation',
  ENTERTAINMENT = 'Entertainment',
  UTILITIES = 'Utilities',
  HEALTHCARE = 'Healthcare',
  SHOPPING = 'Shopping',
  OTHER = 'Other'
}
```

---

## Alert Types

```typescript
export type AlertType =
  | 'BUDGET_80_PERCENT' // 80% of budget spent
  | 'BUDGET_100_PERCENT' // 100% of budget spent
  | 'BUDGET_EXCEEDED' // Budget exceeded
```

---

## Testing

To test the integration:

1. Start backend server: `http://localhost:8080`
2. Create `.env` file with `VITE_API_BASE_URL=http://localhost:8080`
3. Start frontend: `npm run dev`
4. Use the services in your components

---

## React Component Example

```typescript
import React, { useEffect, useState } from 'react';
import { budgetService } from '../services/budgetService';
import { BudgetStatus } from '../types/budget';

const BudgetDashboard: React.FC = () => {
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const data = await budgetService.getCurrentBudgetStatus();
        setBudgets(data);
      } catch (error) {
        console.error('Failed to fetch budgets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Your Budgets</h2>
      {budgets.map(budget => (
        <div key={budget.budgetId}>
          <h3>{budget.category || 'General'}</h3>
          <p>Spent: ${budget.spent} / ${budget.amount}</p>
          <p>Remaining: ${budget.remaining}</p>
          <p>Usage: {budget.percentageUsed}%</p>
        </div>
      ))}
    </div>
  );
};

export default BudgetDashboard;
```

---

## Summary

All backend API endpoints from `API_USAGE_GUIDE.md` are now available as TypeScript services:

✅ **authService** - Register, Login  
✅ **budgetService** - Create, Read, Update budgets  
✅ **transactionService** - CRUD operations on transactions  
✅ **plaidService** - Bank integration and sync  
✅ **alertService** - Budget alerts management

All services are fully typed, handle authentication automatically, and match the backend API exactly.
