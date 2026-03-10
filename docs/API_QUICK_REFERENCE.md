# API Quick Reference - TypeScript Services

## Import Services

```typescript
import { authService } from '../services/authService'
import { budgetService } from '../services/budgetService'
import { transactionService } from '../services/transactionService'
import { plaidService } from '../services/plaidService'
import { alertService } from '../services/alertService'
```

## Authentication

```typescript
// Register
await authService.register({ username, password })

// Login
await authService.login({ username, password })
```

## Budgets

```typescript
// Create category budget
await budgetService.createBudget({
  amount: 500,
  period: 'MONTHLY',
  category: 'Food'
})

// Create general budget
await budgetService.createBudget({ amount: 2000, period: 'MONTHLY' })

// Get all budgets
const budgets = await budgetService.getCurrentBudgetStatus()

// Get specific budget
const budget = await budgetService.getBudgetById(id)

// Update budget
await budgetService.updateBudget(id, 600)
```

## Transactions

```typescript
// Create transaction
await transactionService.createTransaction({
  amount: 50,
  category: Category.FOOD,
  description: 'Groceries',
  date: '2026-03-08'
})

// Get all transactions
const transactions = await transactionService.getAllTransactions()

// Update transaction
await transactionService.updateTransaction(id, data)

// Delete transaction
await transactionService.deleteTransaction(id)

// Get category totals
const totals = await transactionService.getTotalsByCategory()
```

## Plaid Integration

```typescript
// Create link token
const { linkToken } = await plaidService.createLinkToken()

// Create public token (sandbox)
const { publicToken } = await plaidService.createPublicToken('ins_109508')

// Exchange token
await plaidService.exchangePublicToken(publicToken)

// Sync transactions
const result = await plaidService.syncTransactions()

// Get linked accounts
const { accounts, linked } = await plaidService.getLinkedAccounts()

// Unlink account
await plaidService.unlinkAccount()
```

## Alerts

```typescript
// Get all alerts
const alerts = await alertService.getAlerts()

// Dismiss alert
await alertService.dismissAlert(id)
```

## Categories

```typescript
Category.FOOD
Category.TRANSPORTATION
Category.ENTERTAINMENT
Category.UTILITIES
Category.HEALTHCARE
Category.SHOPPING
Category.OTHER
```

## Alert Types

```typescript
'BUDGET_80_PERCENT' // 80% spent
'BUDGET_100_PERCENT' // 100% spent
'BUDGET_EXCEEDED' // Over budget
```

## Sandbox Institution IDs

```typescript
'ins_109508' // Chase
'ins_109509' // Bank of America
'ins_109510' // Wells Fargo
```

## Error Handling

```typescript
try {
  const result = await service.method()
} catch (error: any) {
  if (error.response) {
    // Server error
    console.error(error.response.data.message)
  } else if (error.request) {
    // Network error
    console.error('Network error')
  } else {
    // Other error
    console.error(error.message)
  }
}
```

## Environment Setup

```env
VITE_API_BASE_URL=http://localhost:8080
```

## All Endpoints Mapped

✅ POST /api/auth/register → authService.register()  
✅ POST /api/auth/login → authService.login()  
✅ POST /api/budgets → budgetService.createBudget()  
✅ GET /api/budgets/current → budgetService.getCurrentBudgetStatus()  
✅ GET /api/budgets/{id} → budgetService.getBudgetById()  
✅ PUT /api/budgets/{id} → budgetService.updateBudget()  
✅ POST /api/transactions → transactionService.createTransaction()  
✅ GET /api/transactions → transactionService.getAllTransactions()  
✅ PUT /api/transactions/{id} → transactionService.updateTransaction()  
✅ DELETE /api/transactions/{id} → transactionService.deleteTransaction()  
✅ GET /api/transactions/by-category → transactionService.getTotalsByCategory()  
✅ POST /api/plaid/link-token → plaidService.createLinkToken()  
✅ POST /api/plaid/public-token → plaidService.createPublicToken()  
✅ POST /api/plaid/exchange-token → plaidService.exchangePublicToken()  
✅ POST /api/plaid/sync-transactions → plaidService.syncTransactions()  
✅ GET /api/plaid/accounts → plaidService.getLinkedAccounts()  
✅ DELETE /api/plaid/unlink → plaidService.unlinkAccount()  
✅ GET /api/alerts → alertService.getAlerts()  
✅ PUT /api/alerts/{id}/dismiss → alertService.dismissAlert()
