# Expense Tracker API - Complete Usage Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Managing Budgets](#managing-budgets)
4. [Managing Transactions](#managing-transactions)
5. [Plaid Integration](#plaid-integration)
6. [Alerts](#alerts)
7. [Category-Based Budget Tracking](#category-based-budget-tracking)
8. [Common Workflows](#common-workflows)

---

## Getting Started

### Prerequisites

- Server running on `http://localhost:8080`
- Postman installed with the collection imported
- For Plaid: Plaid sandbox credentials configured in `application.properties`

### Base URL

```
http://localhost:8080
```

---

## Authentication

### 1. Register a New User

**Endpoint:** `POST /api/auth/register`

**Request Body:**

```json
{
  "username": "testuser",
  "password": "password123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "testuser"
}
```

**Notes:**

- Username must be unique
- Password is hashed with BCrypt
- Token is automatically saved in Postman collection variable

### 2. Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**

```json
{
  "username": "testuser",
  "password": "password123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "testuser"
}
```

**Notes:**

- Token expires after 24 hours (configurable in `application.properties`)
- Token is automatically saved and used in subsequent requests

---

## Managing Budgets

### Understanding Budget Types

#### 1. Category-Specific Budget

Tracks spending for a specific category only (e.g., Food, Transportation)

#### 2. General Budget

Tracks all spending across all categories (no category specified)

### Valid Categories

- `Food`
- `Transportation`
- `Entertainment`
- `Utilities`
- `Healthcare`
- `Shopping`
- `Other`

### Create a Category-Specific Budget

**Endpoint:** `POST /api/budgets`

**Headers:**

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Request Body:**

```json
{
  "amount": 500.0,
  "period": "MONTHLY",
  "category": "Food"
}
```

**Period Options:**

- `"MONTHLY"` - Uses current month (e.g., 2026-03)
- `"2026-03"` - Specific month in YYYY-MM format

**Response:**

```json
{
  "id": "uuid-here",
  "userId": "user-id",
  "amount": 500.0,
  "period": "2026-03",
  "category": "Food",
  "createdAt": "2026-03-08T10:00:00",
  "updatedAt": "2026-03-08T10:00:00"
}
```

### Create a General Budget (All Categories)

**Request Body:**

```json
{
  "amount": 2000.0,
  "period": "MONTHLY"
}
```

**Notes:**

- Omit `category` field to track all spending
- You can have both general and category-specific budgets simultaneously

### Get All Budgets

**Endpoint:** `GET /api/budgets/current`

**Headers:**

```
Authorization: Bearer {{token}}
```

**Response:**

```json
[
  {
    "budgetId": "uuid-1",
    "amount": 500.0,
    "spent": 150.0,
    "remaining": 350.0,
    "percentageUsed": 30.0,
    "period": "2026-03",
    "category": "Food"
  },
  {
    "budgetId": "uuid-2",
    "amount": 300.0,
    "spent": 45.0,
    "remaining": 255.0,
    "percentageUsed": 15.0,
    "period": "2026-03",
    "category": "Transportation"
  }
]
```

**Notes:**

- `spent` is calculated from transactions matching the budget's category
- `percentageUsed` = (spent / amount) \* 100
- Automatically includes both manual and Plaid transactions

### Get Budget by ID

**Endpoint:** `GET /api/budgets/{id}`

**Headers:**

```
Authorization: Bearer {{token}}
```

### Update Budget Amount

**Endpoint:** `PUT /api/budgets/{id}`

**Headers:**

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Request Body:**

```json
{
  "amount": 600.0
}
```

**Notes:**

- Only the amount can be updated
- To change category or period, create a new budget

---

## Managing Transactions

### Create a Manual Transaction

**Endpoint:** `POST /api/transactions`

**Headers:**

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Request Body:**

```json
{
  "amount": 50.0,
  "category": "Food",
  "description": "Grocery shopping",
  "date": "2026-03-08"
}
```

**Valid Categories:**

- `Food`
- `Transportation`
- `Entertainment`
- `Utilities`
- `Healthcare`
- `Shopping`
- `Other`

**Response:**

```json
{
  "id": "uuid-here",
  "userId": "user-id",
  "amount": 50.0,
  "date": "2026-03-08",
  "description": "Grocery shopping",
  "category": "Food",
  "source": "MANUAL",
  "createdAt": "2026-03-08T10:00:00"
}
```

**What Happens Automatically:**

1. Transaction is saved
2. All budgets are checked for recalculation
3. Category-specific budgets (e.g., Food budget) are updated
4. General budgets (no category) are updated
5. Alerts are generated if budget thresholds exceeded

### Get All Transactions

**Endpoint:** `GET /api/transactions`

**Headers:**

```
Authorization: Bearer {{token}}
```

**Response:**

```json
[
  {
    "id": "uuid-1",
    "amount": 50.0,
    "category": "Food",
    "description": "Grocery shopping",
    "date": "2026-03-08",
    "source": "MANUAL",
    "createdAt": "2026-03-08T10:00:00"
  },
  {
    "id": "uuid-2",
    "amount": 45.0,
    "category": "Transportation",
    "description": "Gas Station",
    "date": "2026-03-07",
    "source": "PLAID",
    "plaidTransactionId": "plaid-tx-id",
    "merchantName": "Shell",
    "plaidCategory": "Gas",
    "createdAt": "2026-03-07T15:30:00"
  }
]
```

**Notes:**

- Includes both manual and Plaid-synced transactions
- `source` field indicates origin: `MANUAL` or `PLAID`
- Plaid transactions include additional fields

### Update Transaction

**Endpoint:** `PUT /api/transactions/{id}`

**Headers:**

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Request Body:**

```json
{
  "amount": 75.0,
  "category": "Food",
  "description": "Updated grocery shopping",
  "date": "2026-03-08"
}
```

**Notes:**

- Budgets are automatically recalculated after update

### Delete Transaction

**Endpoint:** `DELETE /api/transactions/{id}`

**Headers:**

```
Authorization: Bearer {{token}}
```

**Notes:**

- Budgets are automatically recalculated after deletion

---

## Plaid Integration

### Overview

Plaid integration allows automatic syncing of bank transactions. Plaid categories are automatically mapped to application categories.

### Category Mapping Examples

| Plaid Category | App Category   |
| -------------- | -------------- |
| Groceries      | Food           |
| Restaurants    | Food           |
| Gas            | Transportation |
| Parking        | Transportation |
| Movies & DVDs  | Entertainment  |
| Electric       | Utilities      |
| Pharmacy       | Healthcare     |
| Clothing       | Shopping       |

### Step 1: Create Public Token

**Endpoint:** `POST /api/plaid/public-token`

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "institution_id": "ins_109508"
}
```

**Common Sandbox Institution IDs:**

- `ins_109508` - Chase
- `ins_109509` - Bank of America
- `ins_109510` - Wells Fargo

**Response:**

```json
{
  "publicToken": "public-sandbox-xxxxx"
}
```

**Notes:**

- No authentication required
- Public token is automatically saved in Postman variable
- Use this token in the next step

### Step 2: Exchange Public Token

**Endpoint:** `POST /api/plaid/exchange-token`

**Headers:**

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Request Body:**

```json
{
  "publicToken": "{{publicToken}}"
}
```

**Response:**

```json
{
  "success": true,
  "accountId": "account-uuid",
  "institutionName": "Chase"
}
```

**Notes:**

- Links the bank account to your user
- Access token is encrypted and stored securely

### Step 3: Sync Transactions

**Endpoint:** `POST /api/plaid/sync-transactions`

**Headers:**

```
Authorization: Bearer {{token}}
```

**Response:**

```json
{
  "success": true,
  "newTransactionCount": 15,
  "errors": []
}
```

**What Happens:**

1. Fetches transactions from last 30 days
2. Skips pending transactions
3. Maps Plaid categories to app categories
4. Saves transactions with `source: "PLAID"`
5. Automatically recalculates all budgets
6. Updates category-specific budget spending
7. Generates alerts if thresholds exceeded

**Example Synced Transaction:**

```json
{
  "id": "uuid",
  "amount": 45.0,
  "category": "Transportation",
  "description": "Shell Gas Station",
  "date": "2026-03-07",
  "source": "PLAID",
  "plaidTransactionId": "plaid-tx-123",
  "merchantName": "Shell",
  "plaidCategory": "Gas"
}
```

### Get Linked Accounts

**Endpoint:** `GET /api/plaid/accounts`

**Headers:**

```
Authorization: Bearer {{token}}
```

**Response:**

```json
{
  "accounts": [
    {
      "id": "account-uuid",
      "institutionName": "Chase",
      "accountName": "Checking",
      "accountMask": "1234",
      "linkedAt": "2026-03-08T10:00:00",
      "lastSyncAt": "2026-03-08T11:00:00",
      "isActive": true
    }
  ],
  "linked": true
}
```

### Unlink Account

**Endpoint:** `DELETE /api/plaid/unlink`

**Headers:**

```
Authorization: Bearer {{token}}
```

**Response:**

```json
{
  "success": true
}
```

**Notes:**

- Deactivates all linked Plaid accounts
- Does not delete existing transactions

---

## Alerts

### Get All Alerts

**Endpoint:** `GET /api/alerts`

**Headers:**

```
Authorization: Bearer {{token}}
```

**Response:**

```json
[
  {
    "id": "alert-uuid",
    "type": "BUDGET_EXCEEDED",
    "budgetAmount": 500.0,
    "currentSpending": 550.0,
    "percentageExceeded": 10.0,
    "period": "2026-03",
    "createdAt": "2026-03-08T12:00:00",
    "dismissed": false
  }
]
```

**Alert Types:**

- `BUDGET_80_PERCENT` - 80% of budget spent
- `BUDGET_100_PERCENT` - 100% of budget spent
- `BUDGET_EXCEEDED` - Budget exceeded

### Dismiss Alert

**Endpoint:** `PUT /api/alerts/{id}/dismiss`

**Headers:**

```
Authorization: Bearer {{token}}
```

**Response:**

```json
{
  "id": "alert-uuid",
  "dismissed": true
}
```

---

## Category-Based Budget Tracking

### How It Works

#### Scenario 1: Category-Specific Budget

1. Create a Food budget for $500
2. Create a Food transaction for $50
3. Get budgets → Food budget shows $50 spent
4. Sync Plaid transactions → Grocery transaction ($30) is mapped to Food
5. Get budgets → Food budget shows $80 spent ($50 + $30)

#### Scenario 2: Multiple Category Budgets

1. Create Food budget for $500
2. Create Transportation budget for $300
3. Create Food transaction for $50
4. Create Transportation transaction for $45
5. Get budgets:
   - Food budget: $50 spent
   - Transportation budget: $45 spent

#### Scenario 3: General + Category Budgets

1. Create general budget (no category) for $2000
2. Create Food budget for $500
3. Create Food transaction for $50
4. Create Transportation transaction for $45
5. Get budgets:
   - General budget: $95 spent (all transactions)
   - Food budget: $50 spent (only Food transactions)

### Category Matching Rules

- **Case-insensitive**: "Food", "food", "FOOD" all match
- **Exact match**: "Food" matches "Food" but not "Fast Food"
- **Plaid auto-mapping**: Plaid categories automatically mapped to app categories

---

## Common Workflows

### Workflow 1: Basic Manual Expense Tracking

```
1. Register/Login
2. Create a general budget (no category)
3. Create transactions as expenses occur
4. Check budget status regularly
5. Receive alerts when thresholds exceeded
```

### Workflow 2: Category-Based Budgeting

```
1. Register/Login
2. Create category-specific budgets:
   - Food: $500
   - Transportation: $300
   - Entertainment: $200
3. Create transactions with appropriate categories
4. Monitor each category budget separately
5. Adjust budgets as needed
```

### Workflow 3: Plaid Integration

```
1. Register/Login
2. Create category-specific budgets
3. Create public token (Plaid)
4. Exchange public token to link bank
5. Sync transactions (automatic category mapping)
6. Review synced transactions
7. Budgets automatically updated
8. Receive alerts if over budget
```

### Workflow 4: Mixed Manual + Plaid

```
1. Register/Login
2. Create budgets (general or category-specific)
3. Link Plaid account and sync
4. Add manual transactions for cash expenses
5. Both manual and Plaid transactions update budgets
6. Monitor combined spending
```

---

## Tips & Best Practices

### Budget Management

- Use category-specific budgets for better control
- Create budgets at the start of each month
- Review budget status weekly
- Adjust amounts based on spending patterns

### Transaction Management

- Add transactions promptly for accuracy
- Use consistent category names
- Include descriptive descriptions
- Sync Plaid regularly (daily or weekly)

### Plaid Integration

- Test with sandbox first
- Sync transactions regularly
- Review mapped categories
- Keep access tokens secure

### Category Usage

- Stick to the 7 standard categories
- Use "Other" for miscellaneous expenses
- Be consistent with categorization
- Review category totals monthly

---

## Troubleshooting

### Issue: Budget not updating after transaction

**Solution:**

- Verify transaction category matches budget category (case-insensitive)
- Check transaction date is within budget period
- Ensure budget exists for that period

### Issue: Plaid transactions not syncing

**Solution:**

- Verify Plaid credentials in `application.properties`
- Check account is linked and active
- Ensure using sandbox institution IDs for testing
- Review server logs for errors

### Issue: Categories not matching

**Solution:**

- Use exact category names from valid list
- Categories are case-insensitive but must match
- Check Plaid category mapping in CategoryMapper

### Issue: Token expired

**Solution:**

- Login again to get new token
- Token expires after 24 hours by default
- Token is automatically saved in Postman

---

## API Response Codes

| Code | Meaning      | Common Causes                   |
| ---- | ------------ | ------------------------------- |
| 200  | Success      | Request completed successfully  |
| 201  | Created      | Resource created successfully   |
| 400  | Bad Request  | Invalid input, validation error |
| 401  | Unauthorized | Missing or invalid token        |
| 403  | Forbidden    | Access denied                   |
| 404  | Not Found    | Resource doesn't exist          |
| 500  | Server Error | Internal server error           |

---

## Security Notes

- Always use HTTPS in production
- Tokens are JWT-based and expire after 24 hours
- Passwords are hashed with BCrypt
- Plaid access tokens are encrypted in database
- Never share your authentication token
- Keep Plaid credentials secure

---

## Support & Resources

- **Postman Collection**: Import `expense-tracker-postman-collection.json`
- **Plaid Sandbox**: https://plaid.com/docs/sandbox/
- **Category Mapping**: See `CategoryMapper.java`
- **Database Schema**: See `schema.sql`

---

## Quick Reference

### Authentication

- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`

### Budgets

- Create: `POST /api/budgets`
- Get All: `GET /api/budgets/current`
- Get One: `GET /api/budgets/{id}`
- Update: `PUT /api/budgets/{id}`

### Transactions

- Create: `POST /api/transactions`
- Get All: `GET /api/transactions`
- Update: `PUT /api/transactions/{id}`
- Delete: `DELETE /api/transactions/{id}`

### Plaid

- Create Token: `POST /api/plaid/public-token`
- Exchange: `POST /api/plaid/exchange-token`
- Sync: `POST /api/plaid/sync-transactions`
- Get Accounts: `GET /api/plaid/accounts`
- Unlink: `DELETE /api/plaid/unlink`

### Alerts

- Get All: `GET /api/alerts`
- Dismiss: `PUT /api/alerts/{id}/dismiss`
