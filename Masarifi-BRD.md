# Business Requirements Document (BRD)

## Masarifi — Personal Expense Tracker & Budget Management Application

**Document Version:** 1.0  
**Date:** March 15, 2026  
**Status:** Draft

---

## 1. Executive Summary

Masarifi is a personal finance management application that enables individuals to track their spending, set and monitor budgets, and receive proactive alerts when approaching budget limits. The application supports both manual transaction entry and automated bank transaction importing via the Plaid financial data platform. The goal is to give users a clear, real-time picture of their financial health and help them make informed spending decisions.

---

## 2. Business Objectives

1. Provide users with a centralized platform to record and review all personal expenses.
2. Enable proactive budget management through configurable spending limits per category and period.
3. Reduce manual effort by automatically importing transactions from linked bank accounts.
4. Increase financial awareness through visual analytics and automated budget alerts.
5. Deliver a secure, user-specific experience where financial data is isolated per account.

---

## 3. Scope

### 3.1 In Scope

- User registration and authentication
- Manual transaction management (create, read, update, delete)
- Budget creation and tracking (general and category-specific)
- Automated budget threshold alerts (WARNING and CRITICAL)
- Bank account integration via Plaid (link, sync, unlink)
- Spending analytics and data visualization
- Dark mode UI support

### 3.2 Out of Scope

- Multi-currency support
- Investment or savings account tracking
- Tax reporting or export
- Mobile native applications (iOS/Android)
- Multi-user household budgeting
- Bill payment or financial transfers

---

## 4. Stakeholders

| Role                 | Responsibility                                                            |
| -------------------- | ------------------------------------------------------------------------- |
| End User             | Registers, logs in, manages transactions and budgets, links bank accounts |
| System Administrator | Manages infrastructure, configures Plaid credentials and encryption keys  |
| Backend Developer    | Maintains Spring Boot API, database schema, and Plaid integration         |
| Frontend Developer   | Maintains React/TypeScript UI and service layer                           |

---

## 5. Functional Requirements

### 5.1 User Authentication

**FR-AUTH-01:** The system shall allow new users to register with a unique username and password.  
**FR-AUTH-02:** The system shall reject registration if the username already exists.  
**FR-AUTH-03:** The system shall authenticate users via username and password and return a JWT token on success.  
**FR-AUTH-04:** The system shall return HTTP 401 for invalid credentials.  
**FR-AUTH-05:** The JWT token shall expire after a configurable duration (default: 24 hours).  
**FR-AUTH-06:** All protected API endpoints shall require a valid Bearer token in the Authorization header.  
**FR-AUTH-07:** The frontend shall automatically redirect unauthenticated users to the login screen when a 401 response is received.  
**FR-AUTH-08:** User passwords shall be stored as BCrypt hashes; plain-text passwords shall never be persisted.

---

### 5.2 Transaction Management

**FR-TXN-01:** Authenticated users shall be able to create a manual transaction with the following required fields: amount (> 0), date (not in the future), description (max 200 characters), and category.  
**FR-TXN-02:** The system shall support the following transaction categories: Food, Transportation, Entertainment, Utilities, Healthcare, Shopping, Other.  
**FR-TXN-03:** Authenticated users shall be able to retrieve all their transactions, including a running total.  
**FR-TXN-04:** Authenticated users shall be able to update any of their own transactions.  
**FR-TXN-05:** Authenticated users shall be able to delete any of their own transactions.  
**FR-TXN-06:** The system shall return spending totals grouped by category, with optional date range filtering.  
**FR-TXN-07:** Each transaction shall record its source: MANUAL (user-entered) or PLAID (bank-imported).  
**FR-TXN-08:** Creating, updating, or deleting a transaction shall automatically trigger a budget recalculation and alert check.

---

### 5.3 Budget Management

**FR-BUD-01:** Authenticated users shall be able to create a budget by specifying an amount and a period (YYYY-MM format or "MONTHLY").  
**FR-BUD-02:** Users shall optionally assign a budget to a specific spending category; budgets without a category shall apply to all spending.  
**FR-BUD-03:** Only one budget per user per period per category combination shall be allowed; creating a duplicate shall overwrite the existing budget.  
**FR-BUD-04:** The system shall calculate and return budget status including: amount, amount spent, amount remaining, and percentage used.  
**FR-BUD-05:** Category-specific budgets shall only count transactions matching that category toward spending.  
**FR-BUD-06:** General budgets (no category) shall count all transactions in the period toward spending.  
**FR-BUD-07:** Authenticated users shall be able to retrieve all their budgets with current status.  
**FR-BUD-08:** Authenticated users shall be able to retrieve a specific budget by ID.  
**FR-BUD-09:** Authenticated users shall be able to update the amount of an existing budget.  
**FR-BUD-10:** Users shall be able to have both a general budget and multiple category-specific budgets simultaneously for the same period.

---

### 5.4 Alert System

**FR-ALT-01:** The system shall automatically generate a WARNING alert when a user's spending reaches or exceeds 80% of their budget for a given period.  
**FR-ALT-02:** The system shall automatically generate a CRITICAL alert when a user's spending reaches or exceeds 100% of their budget for a given period.  
**FR-ALT-03:** Only one alert of each type (WARNING, CRITICAL) shall exist per user per period; duplicate alerts shall not be created.  
**FR-ALT-04:** Alerts shall be triggered after any transaction creation, update, or deletion.  
**FR-ALT-05:** Authenticated users shall be able to retrieve all their alerts, including an unread count.  
**FR-ALT-06:** Authenticated users shall be able to dismiss an alert; dismissed alerts shall remain in the system for historical reference.  
**FR-ALT-07:** Alert creation failures shall not roll back the triggering transaction.  
**FR-ALT-08:** Each alert shall record: type, budget amount, current spending at time of alert, percentage used, period, dismissed status, and creation timestamp.

---

### 5.5 Bank Account Integration (Plaid)

**FR-PLAID-01:** Authenticated users shall be able to initiate bank account linking via the Plaid Link UI.  
**FR-PLAID-02:** The system shall exchange a Plaid public token for a permanent access token and store it encrypted in the database.  
**FR-PLAID-03:** Plaid access tokens shall be encrypted using AES encryption before persistence; they shall be decrypted only at the time of API calls.  
**FR-PLAID-04:** Authenticated users shall be able to manually trigger a transaction sync from their linked bank account.  
**FR-PLAID-05:** Transaction sync shall fetch transactions from the past 30 days by default.  
**FR-PLAID-06:** Pending transactions from Plaid shall be excluded from import.  
**FR-PLAID-07:** The system shall prevent duplicate imports using the Plaid transaction ID as a unique identifier.  
**FR-PLAID-08:** Plaid transaction categories shall be mapped to the application's category set; unmapped categories shall default to "Other".  
**FR-PLAID-09:** Authenticated users shall be able to view their linked bank accounts and their sync status.  
**FR-PLAID-10:** Authenticated users shall be able to unlink a bank account; unlinking shall deactivate the account record without deleting imported transactions.  
**FR-PLAID-11:** The system shall expose a webhook endpoint (no authentication required) to receive Plaid notifications and automatically trigger transaction syncs.  
**FR-PLAID-12:** Transaction sync shall trigger budget recalculation and alert checking upon completion.  
**FR-PLAID-13:** Plaid-imported transactions shall store additional metadata: Plaid transaction ID, merchant name, and original Plaid category.

---

### 5.6 Analytics & Visualization

**FR-VIZ-01:** The dashboard shall display a spending trends chart over time.  
**FR-VIZ-02:** The dashboard shall display a category breakdown chart showing spending distribution.  
**FR-VIZ-03:** The dashboard shall display a budget insights widget summarizing budget health.  
**FR-VIZ-04:** The dashboard shall display a summary of all active budgets with their current status.  
**FR-VIZ-05:** Active budget alerts shall be displayed prominently as a banner on the dashboard.

---

## 6. Non-Functional Requirements

### 6.1 Security

**NFR-SEC-01:** All API endpoints except `/api/auth/**` and `/api/plaid/webhook` shall require JWT authentication.  
**NFR-SEC-02:** The application shall use stateless session management (no server-side sessions).  
**NFR-SEC-03:** Plaid access tokens shall never be returned to the frontend in plain text.  
**NFR-SEC-04:** JWT secrets and encryption keys shall be externalized from source code and configurable via environment/properties files.  
**NFR-SEC-05:** CORS shall be configurable; wildcard (`*`) is acceptable for development but should be restricted in production.

### 6.2 Performance

**NFR-PERF-01:** The API shall respond to standard CRUD requests within 500ms under normal load.  
**NFR-PERF-02:** Database queries on transactions shall be optimized via indexes on `(user_id, date)`, `(user_id, category)`, `plaid_transaction_id`, and `source`.

### 6.3 Reliability

**NFR-REL-01:** Alert creation failures shall not affect transaction persistence (isolated transaction propagation).  
**NFR-REL-02:** The frontend shall handle API errors gracefully and display user-friendly messages.  
**NFR-REL-03:** The frontend shall automatically handle expired JWT tokens by clearing local storage and redirecting to login.

### 6.4 Usability

**NFR-USE-01:** The application shall support both light and dark display modes.  
**NFR-USE-02:** The UI shall be responsive and usable on common screen sizes.  
**NFR-USE-03:** Navigation between Dashboard, Add Transaction, and Manage Budget views shall require no page reload.

### 6.5 Maintainability

**NFR-MNT-01:** The backend shall follow a layered architecture: Controller → Service → Repository.  
**NFR-MNT-02:** The frontend shall separate API communication into dedicated service modules.  
**NFR-MNT-03:** The application shall include property-based tests (jqwik on backend, fast-check on frontend).

---

## 7. Data Requirements

### 7.1 Core Entities

| Entity       | Key Attributes                                                                                                         |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| User         | id, username, password (hashed)                                                                                        |
| Transaction  | id, userId, amount, date, description, category, source, createdAt, plaidTransactionId, merchantName, plaidCategory    |
| Budget       | id, userId, amount, period (YYYY-MM), category (optional), createdAt, updatedAt                                        |
| Alert        | id, userId, type (WARNING/CRITICAL), budgetAmount, currentSpending, percentageExceeded, period, dismissed, createdAt   |
| PlaidAccount | id, userId, accessToken (encrypted), itemId, institutionName, accountName, accountMask, linkedAt, lastSyncAt, isActive |

### 7.2 Data Integrity Rules

- A user may have at most one budget per (period, category) combination.
- A user may have at most one alert per (type, period) combination.
- A Plaid account is unique per (userId, itemId).
- Transaction amounts must be greater than zero.
- Transaction dates cannot be in the future.
- Transaction descriptions are limited to 200 characters.

---

## 8. Integration Requirements

### 8.1 Plaid Financial Data Platform

| Requirement      | Detail                                                               |
| ---------------- | -------------------------------------------------------------------- |
| Environment      | Sandbox (development), configurable for Production                   |
| Authentication   | Client ID + Secret (server-side only)                                |
| Token Flow       | Link Token → Public Token → Access Token (encrypted at rest)         |
| Data Retrieved   | Transactions (last 30 days per sync)                                 |
| Webhook Support  | TRANSACTIONS.DEFAULT_UPDATE, TRANSACTIONS.INITIAL_UPDATE, ITEM.ERROR |
| Category Mapping | Plaid personal finance categories mapped to 7 app categories         |

---

## 9. API Summary

| Method | Endpoint                      | Auth Required | Description                   |
| ------ | ----------------------------- | ------------- | ----------------------------- |
| POST   | /api/auth/register            | No            | Register new user             |
| POST   | /api/auth/login               | No            | Login, returns JWT            |
| POST   | /api/transactions             | Yes           | Create transaction            |
| GET    | /api/transactions             | Yes           | List all transactions         |
| PUT    | /api/transactions/{id}        | Yes           | Update transaction            |
| DELETE | /api/transactions/{id}        | Yes           | Delete transaction            |
| GET    | /api/transactions/by-category | Yes           | Spending by category          |
| POST   | /api/budgets                  | Yes           | Create budget                 |
| GET    | /api/budgets/current          | Yes           | List all budgets with status  |
| GET    | /api/budgets/{id}             | Yes           | Get budget by ID              |
| PUT    | /api/budgets/{id}             | Yes           | Update budget amount          |
| GET    | /api/alerts                   | Yes           | List alerts with unread count |
| PUT    | /api/alerts/{id}/dismiss      | Yes           | Dismiss alert                 |
| POST   | /api/plaid/public-token       | No            | Create sandbox public token   |
| POST   | /api/plaid/exchange-token     | Yes           | Exchange public token         |
| POST   | /api/plaid/sync-transactions  | Yes           | Sync bank transactions        |
| GET    | /api/plaid/accounts           | Yes           | List linked accounts          |
| DELETE | /api/plaid/unlink             | Yes           | Unlink bank account           |
| POST   | /api/plaid/webhook            | No            | Receive Plaid webhooks        |

---

## 10. Technology Stack

| Layer              | Technology                         |
| ------------------ | ---------------------------------- |
| Backend Language   | Java 17                            |
| Backend Framework  | Spring Boot 3.2.0                  |
| Security           | Spring Security + JJWT 0.12.3      |
| ORM                | Spring Data JPA / Hibernate        |
| Database           | SQLite (development), configurable |
| Bank Integration   | Plaid Java SDK v17.0.0             |
| Build Tool         | Maven                              |
| Frontend Language  | TypeScript 5.3.3                   |
| Frontend Framework | React 18.2.0                       |
| Build Tool (FE)    | Vite 5.0.7                         |
| HTTP Client        | Axios                              |
| Charts             | Recharts 3.8.0                     |
| Plaid UI           | react-plaid-link v4.1.1            |
| Testing (BE)       | jqwik (property-based)             |
| Testing (FE)       | fast-check (property-based)        |

---

## 11. Assumptions & Constraints

### Assumptions

- Users have access to a modern web browser.
- Plaid sandbox credentials are sufficient for development and testing.
- A single linked bank account per user is the primary use case (multi-account is supported but not the focus).
- The application is deployed as a single-instance service (no horizontal scaling requirements at this stage).

### Constraints

- The SQLite database is suitable for singlgit pull e-instance deployments; migration to a production-grade RDBMS (e.g., PostgreSQL) would be required for multi-instance or high-load scenarios.
- Plaid integration is limited to US financial institutions.
- JWT secrets and encryption keys must be rotated manually; no automated key rotation is in scope.
- CORS is currently open to all origins and must be restricted before production deployment.

---

## 12. Glossary

| Term           | Definition                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| Plaid          | A financial data platform that enables secure bank account linking and transaction retrieval              |
| JWT            | JSON Web Token — a stateless authentication token issued on login                                         |
| Access Token   | A Plaid-issued credential that grants access to a user's bank data; stored encrypted                      |
| Public Token   | A short-lived Plaid token generated after user bank authentication; exchanged for an access token         |
| WARNING Alert  | A budget alert triggered when spending reaches 80% of the budget limit                                    |
| CRITICAL Alert | A budget alert triggered when spending reaches or exceeds 100% of the budget limit                        |
| Period         | A budget tracking interval in YYYY-MM format (e.g., 2026-03)                                              |
| Category       | A spending classification: Food, Transportation, Entertainment, Utilities, Healthcare, Shopping, or Other |
| MANUAL         | A transaction entered directly by the user                                                                |
| PLAID          | A transaction automatically imported from a linked bank account                                           |
