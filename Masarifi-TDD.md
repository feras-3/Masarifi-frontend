# Test Design Document (TDD)

## Masarifi — Personal Expense Tracker & Budget Management Application

**Document Version:** 1.0  
**Date:** March 15, 2026  
**Status:** Active

---

## 1. Overview

This document defines the complete test strategy, test cases, and coverage mapping for the Masarifi application. It covers both the Spring Boot backend and the React/TypeScript frontend.

---

## 2. Test Strategy

### 2.1 Testing Pyramid

```
         [E2E / Integration]
        /                    \
       [Service Integration]  [Frontend Component]
      /                                            \
     [Unit — Service / Util]    [Unit — Service Layer]
    /                                                  \
   [Property-Based (jqwik / fast-check)]
```

### 2.2 Test Types

| Type                | Tool                      | Scope                       |
| ------------------- | ------------------------- | --------------------------- |
| Unit — Backend      | JUnit 5 + Mockito         | Service, Utility classes    |
| Controller (Slice)  | MockMvc + @SpringBootTest | REST endpoints              |
| Integration         | @SpringBootTest + H2      | Service ↔ Repository ↔ DB   |
| Property-Based (BE) | jqwik                     | Auth, validation invariants |
| Unit — Frontend     | Vitest + Testing Library  | Services, Components        |
| Property-Based (FE) | fast-check                | Validation, formatting      |

### 2.3 Test Environments

| Environment    | Database     | Profile |
| -------------- | ------------ | ------- |
| Backend tests  | H2 in-memory | `test`  |
| Frontend tests | N/A (mocked) | N/A     |

---

## 3. Requirements Traceability Matrix

| Requirement                          | Test Class(es)                                         |
| ------------------------------------ | ------------------------------------------------------ |
| FR-AUTH-01 Register                  | `AuthControllerTest`, `AuthenticationServiceTest`      |
| FR-AUTH-02 Duplicate username        | `AuthenticationServiceTest`                            |
| FR-AUTH-03 Login + JWT               | `AuthControllerTest`, `JwtUtilTest`                    |
| FR-AUTH-04 Invalid credentials → 401 | `AuthControllerTest`                                   |
| FR-AUTH-05 JWT expiry                | `JwtUtilTest`                                          |
| FR-AUTH-06 Protected endpoints       | `AuthenticationPropertyTest`                           |
| FR-AUTH-07 Frontend 401 redirect     | `apiClient.test.ts`                                    |
| FR-AUTH-08 BCrypt storage            | `AuthenticationServiceTest`                            |
| FR-TXN-01 Create transaction         | `TransactionControllerTest`, `TransactionServiceTest`  |
| FR-TXN-02 Valid categories           | `TransactionServiceTest`                               |
| FR-TXN-03 List transactions          | `TransactionControllerTest`                            |
| FR-TXN-04 Update transaction         | `TransactionControllerTest`, `TransactionServiceTest`  |
| FR-TXN-05 Delete transaction         | `TransactionControllerTest`, `TransactionServiceTest`  |
| FR-TXN-06 Category totals            | `TransactionControllerTest`                            |
| FR-TXN-07 Source field               | `TransactionServiceTest`                               |
| FR-TXN-08 Budget recalc on change    | `TransactionBudgetIntegrationTest`                     |
| FR-BUD-01 Create budget              | `BudgetControllerTest`, `BudgetServiceTest`            |
| FR-BUD-02 Category budget            | `BudgetServiceTest`                                    |
| FR-BUD-03 Overwrite duplicate        | `BudgetServiceTest`                                    |
| FR-BUD-04 Budget status calc         | `BudgetServiceTest`                                    |
| FR-BUD-05 Category-specific spend    | `BudgetServiceTest`                                    |
| FR-BUD-06 General budget spend       | `BudgetServiceTest`                                    |
| FR-BUD-07 List budgets               | `BudgetControllerTest`                                 |
| FR-BUD-08 Get budget by ID           | `BudgetControllerTest`                                 |
| FR-BUD-09 Update budget              | `BudgetControllerTest`, `BudgetServiceTest`            |
| FR-ALT-01 WARNING at 80%             | `AlertServiceTest`, `TransactionBudgetIntegrationTest` |
| FR-ALT-02 CRITICAL at 100%           | `AlertServiceTest`, `TransactionBudgetIntegrationTest` |
| FR-ALT-03 No duplicate alerts        | `AlertServiceTest`                                     |
| FR-ALT-04 Alert on txn change        | `TransactionBudgetIntegrationTest`                     |
| FR-ALT-05 List alerts                | `AlertControllerTest`                                  |
| FR-ALT-06 Dismiss alert              | `AlertControllerTest`, `AlertServiceTest`              |
| FR-ALT-07 Alert failure isolation    | `AlertServiceTest`                                     |
| FR-PLAID-01 Link account             | `PlaidControllerTest`                                  |
| FR-PLAID-02 Token exchange           | `PlaidControllerTest`                                  |
| FR-PLAID-04 Manual sync              | `PlaidControllerTest`                                  |
| FR-PLAID-07 Dedup by plaidTxId       | `PlaidIntegrationFlowTest`                             |
| FR-PLAID-09 List accounts            | `PlaidControllerTest`                                  |
| FR-PLAID-10 Unlink account           | `PlaidControllerTest`                                  |
| FR-PLAID-11 Webhook                  | `PlaidControllerTest`                                  |

---

## 4. Backend Test Cases

### 4.1 JwtUtilTest

| TC-ID  | Test Name                                                  | Input              | Expected                             |
| ------ | ---------------------------------------------------------- | ------------------ | ------------------------------------ |
| JWT-01 | generateToken_ReturnsNonNullToken                          | username="alice"   | non-null, non-empty string           |
| JWT-02 | generateToken_TokenContainsUsername                        | username="alice"   | getUsernameFromToken returns "alice" |
| JWT-03 | validateToken_WithValidToken_ReturnsTrue                   | valid token        | true                                 |
| JWT-04 | validateToken_WithExpiredToken_ReturnsFalse                | expired token      | false                                |
| JWT-05 | validateToken_WithTamperedToken_ReturnsFalse               | modified signature | false                                |
| JWT-06 | validateToken_WithEmptyString_ReturnsFalse                 | ""                 | false                                |
| JWT-07 | validateToken_WithNull_ReturnsFalse                        | null               | false                                |
| JWT-08 | getUsernameFromToken_WithValidToken_ReturnsCorrectUsername | token for "bob"    | "bob"                                |

### 4.2 AuthenticationServiceTest

| TC-ID | Test Name                                      | Input             | Expected                           |
| ----- | ---------------------------------------------- | ----------------- | ---------------------------------- |
| AS-01 | register_WithNewUsername_CreatesUser           | "newuser", "pass" | User saved, password BCrypt-hashed |
| AS-02 | register_WithDuplicateUsername_ThrowsException | existing username | RuntimeException                   |
| AS-03 | login_WithValidCredentials_ReturnsToken        | valid user/pass   | non-null JWT string                |
| AS-04 | login_WithWrongPassword_ThrowsException        | wrong password    | RuntimeException                   |
| AS-05 | login_WithNonExistentUser_ThrowsException      | unknown username  | RuntimeException                   |
| AS-06 | register_PasswordIsHashed                      | any password      | stored password != plain text      |

### 4.3 AuthControllerTest

| TC-ID | Test Name                                     | Input             | Expected               |
| ----- | --------------------------------------------- | ----------------- | ---------------------- |
| AC-01 | login_WithValidCredentials_Returns200AndToken | valid body        | 200, token in response |
| AC-02 | login_WithInvalidCredentials_Returns401       | wrong password    | 401                    |
| AC-03 | register_WithNewUser_Returns200               | new username      | 200, success message   |
| AC-04 | register_WithDuplicateUsername_Returns400     | existing username | 400                    |

### 4.4 TransactionServiceTest

| TC-ID | Test Name                                                     | Input              | Expected                                |
| ----- | ------------------------------------------------------------- | ------------------ | --------------------------------------- |
| TS-01 | createTransaction_WithValidData_ReturnsSavedTransaction       | valid request      | Transaction with id, source=MANUAL      |
| TS-02 | createTransaction_WithInvalidCategory_ThrowsException         | category="Invalid" | IllegalArgumentException                |
| TS-03 | createTransaction_TriggersRecalculation                       | valid request      | budgetService.recalculateBalance called |
| TS-04 | getAllTransactions_ReturnsUserTransactions                    | userId             | list sorted by date desc                |
| TS-05 | updateTransaction_WithValidData_ReturnsUpdated                | valid update       | updated fields reflected                |
| TS-06 | updateTransaction_WhenNotOwner_ThrowsException                | wrong userId       | IllegalArgumentException                |
| TS-07 | updateTransaction_WhenNotFound_ThrowsException                | unknown id         | NoSuchElementException                  |
| TS-08 | deleteTransaction_WhenOwner_DeletesSuccessfully               | valid id+userId    | deleted from repo                       |
| TS-09 | deleteTransaction_WhenNotOwner_ThrowsException                | wrong userId       | IllegalArgumentException                |
| TS-10 | deleteTransaction_WhenNotFound_ThrowsException                | unknown id         | NoSuchElementException                  |
| TS-11 | getTransactionsByCategory_WithValidCategory_ReturnsList       | "Food"             | filtered list                           |
| TS-12 | getTransactionsByCategory_WithInvalidCategory_ThrowsException | "Junk"             | IllegalArgumentException                |

### 4.5 AlertServiceTest

| TC-ID  | Test Name                                              | Input                 | Expected                    |
| ------ | ------------------------------------------------------ | --------------------- | --------------------------- |
| ALT-01 | checkBudgetThresholds_Below80_NoAlertCreated           | 79% spending          | no alert saved              |
| ALT-02 | checkBudgetThresholds_At80_CreatesWarningAlert         | 80% spending          | WARNING alert saved         |
| ALT-03 | checkBudgetThresholds_At100_CreatesBothAlerts          | 100% spending         | WARNING + CRITICAL saved    |
| ALT-04 | checkBudgetThresholds_Above100_CreatesBothAlerts       | 110% spending         | WARNING + CRITICAL saved    |
| ALT-05 | checkBudgetThresholds_DuplicateWarning_NotCreatedTwice | 80% twice             | only 1 WARNING alert        |
| ALT-06 | checkBudgetThresholds_ZeroBudget_NoAlertCreated        | budget=0              | no alert                    |
| ALT-07 | dismissAlert_MarksAlertAsDismissed                     | valid alertId         | dismissed=true              |
| ALT-08 | dismissAlert_WhenNotFound_ThrowsException              | unknown id            | NoSuchElementException      |
| ALT-09 | getUnreadAlertCount_ReturnsOnlyUndismissed             | 2 active, 1 dismissed | count=2                     |
| ALT-10 | getActiveAlerts_ExcludesDismissed                      | mixed alerts          | only non-dismissed returned |

### 4.6 BudgetServiceTest (existing + additions)

| TC-ID | Test Name                                               | Input                  | Expected                 |
| ----- | ------------------------------------------------------- | ---------------------- | ------------------------ |
| BS-01 | createBudget_WithValidData_ShouldSucceed                | ✅ exists              | —                        |
| BS-02 | createBudget_WithCategoryBudget_SavesCategory           | amount+period+category | category stored          |
| BS-03 | createBudget_DuplicatePeriodCategory_OverwritesExisting | same period+category   | old deleted, new saved   |
| BS-04 | getCurrentBudget_WhenExists_ReturnsIt                   | ✅ exists              | —                        |
| BS-05 | getCurrentBudget_WhenNone_ThrowsException               | ✅ exists              | —                        |
| BS-06 | updateBudget_WithValidAmount_Updates                    | ✅ exists              | —                        |
| BS-07 | updateBudget_WithZeroAmount_ThrowsException             | ✅ exists              | —                        |
| BS-08 | updateBudget_WhenNotFound_ThrowsException               | ✅ exists              | —                        |
| BS-09 | updateBudget_WhenNotOwner_ThrowsException               | ✅ exists              | —                        |
| BS-10 | getBudgetStatus_NoTransactions_FullBudget               | ✅ exists              | —                        |
| BS-11 | getBudgetStatus_WithTransactions_CalculatesCorrectly    | ✅ exists              | —                        |
| BS-12 | getBudgetStatus_SpendingExceedsBudget_NegativeRemaining | ✅ exists              | —                        |
| BS-13 | normalizePeriod_WithMONTHLY_ReturnsCurrentYearMonth     | "MONTHLY"              | current YYYY-MM          |
| BS-14 | normalizePeriod_WithYYYYMM_ReturnsSame                  | "2026-03"              | "2026-03"                |
| BS-15 | normalizePeriod_WithInvalidFormat_ThrowsException       | "INVALID"              | IllegalArgumentException |

### 4.7 Controller Tests (existing + additions)

| TC-ID | Test Name                                                            | Covers    |
| ----- | -------------------------------------------------------------------- | --------- |
| TC-01 | TransactionControllerTest.testCreateTransaction                      | ✅ exists |
| TC-02 | TransactionControllerTest.testGetAllTransactions                     | ✅ exists |
| TC-03 | TransactionControllerTest.testUpdateTransaction                      | ✅ exists |
| TC-04 | TransactionControllerTest.testDeleteTransaction                      | ✅ exists |
| TC-05 | TransactionControllerTest.testGetTransactionsByCategory              | ✅ exists |
| TC-06 | TransactionControllerTest.testGetCategoryTotals                      | ✅ exists |
| TC-07 | TransactionControllerTest.testCreateTransactionWithoutAuthentication | ✅ exists |
| TC-08 | BudgetControllerTest.testCreateBudget                                | ✅ exists |
| TC-09 | BudgetControllerTest.testGetCurrentBudget                            | ✅ exists |
| TC-10 | BudgetControllerTest.testUpdateBudget                                | ✅ exists |
| TC-11 | BudgetControllerTest.testCreateBudgetWithoutAuthentication           | ✅ exists |
| TC-12 | AlertControllerTest.testGetAlerts                                    | ✅ exists |
| TC-13 | AlertControllerTest.testDismissAlert                                 | ✅ exists |
| TC-14 | AlertControllerTest.testGetAlertsWithoutAuthentication               | ✅ exists |
| TC-15 | PlaidControllerTest.testCreatePublicToken                            | ✅ exists |
| TC-16 | PlaidControllerTest.testExchangePublicToken                          | ✅ exists |
| TC-17 | PlaidControllerTest.testSyncTransactions                             | ✅ exists |
| TC-18 | PlaidControllerTest.testGetLinkedAccounts                            | ✅ exists |
| TC-19 | PlaidControllerTest.testUnlinkAccount                                | ✅ exists |
| TC-20 | PlaidControllerTest.testHandleWebhook                                | ✅ exists |
| TC-21 | PlaidControllerTest.testCreatePublicTokenWithoutInstitutionId        | ✅ exists |

### 4.8 Integration Tests (existing)

| TC-ID  | Test Name                                                                                 | Covers    |
| ------ | ----------------------------------------------------------------------------------------- | --------- |
| INT-01 | EndToEndIntegrationTest.testCompleteUserFlow                                              | ✅ exists |
| INT-02 | EndToEndIntegrationTest.testTransactionEditAndDeleteFlow                                  | ✅ exists |
| INT-03 | EndToEndIntegrationTest.testBudgetCreationAndUpdateFlow                                   | ✅ exists |
| INT-04 | EndToEndIntegrationTest.testMultipleTransactionsWithCategoryFiltering                     | ✅ exists |
| INT-05 | EndToEndIntegrationTest.testAlertDismissalFlow                                            | ✅ exists |
| INT-06 | EndToEndIntegrationTest.testTransactionFlowWithoutBudget                                  | ✅ exists |
| INT-07 | EndToEndIntegrationTest.testAlertGenerationAtExactThresholds                              | ✅ exists |
| INT-08 | TransactionBudgetIntegrationTest.testTransactionCreationTriggersBudgetRecalculation       | ✅ exists |
| INT-09 | TransactionBudgetIntegrationTest.testTransactionCreationTriggersWarningAlertAt80Percent   | ✅ exists |
| INT-10 | TransactionBudgetIntegrationTest.testTransactionCreationTriggersCriticalAlertAt100Percent | ✅ exists |
| INT-11 | TransactionBudgetIntegrationTest.testTransactionUpdateTriggersBudgetRecalculation         | ✅ exists |
| INT-12 | TransactionBudgetIntegrationTest.testTransactionDeletionTriggersBudgetRecalculation       | ✅ exists |
| INT-13 | TransactionBudgetIntegrationTest.testMultipleTransactionChangesUpdateAlertsCorrectly      | ✅ exists |
| INT-14 | TransactionBudgetIntegrationTest.testTransactionCreationWithoutBudgetDoesNotFail          | ✅ exists |

---

## 5. Frontend Test Cases

### 5.1 authService.test.ts

| TC-ID      | Test Name                     | Input             | Expected                       |
| ---------- | ----------------------------- | ----------------- | ------------------------------ |
| FE-AUTH-01 | login_CallsCorrectEndpoint    | valid credentials | POST /api/auth/login called    |
| FE-AUTH-02 | login_ReturnsTokenAndUsername | mock response     | token + username returned      |
| FE-AUTH-03 | register_CallsCorrectEndpoint | new user data     | POST /api/auth/register called |
| FE-AUTH-04 | register_ReturnsAuthResponse  | mock response     | AuthResponse returned          |

### 5.2 transactionService.test.ts

| TC-ID     | Test Name                                  | Input              | Expected                      |
| --------- | ------------------------------------------ | ------------------ | ----------------------------- |
| FE-TXN-01 | createTransaction_PostsToCorrectEndpoint   | TransactionRequest | POST /api/transactions        |
| FE-TXN-02 | getAllTransactions_ReturnsTransactionArray | mock list          | Transaction[]                 |
| FE-TXN-03 | updateTransaction_PutsToCorrectEndpoint    | id + request       | PUT /api/transactions/{id}    |
| FE-TXN-04 | deleteTransaction_DeletesCorrectEndpoint   | id                 | DELETE /api/transactions/{id} |
| FE-TXN-05 | getTotalsByCategory_ReturnsMap             | mock response      | CategoryTotal[]               |

### 5.3 budgetService.test.ts

| TC-ID     | Test Name                           | Input         | Expected                 |
| --------- | ----------------------------------- | ------------- | ------------------------ |
| FE-BUD-01 | createBudget_PostsToCorrectEndpoint | BudgetRequest | POST /api/budgets        |
| FE-BUD-02 | getCurrentBudgetStatus_GetsBudgets  | mock list     | BudgetStatus[]           |
| FE-BUD-03 | updateBudget_PutsCorrectAmount      | id + amount   | PUT /api/budgets/{id}    |
| FE-BUD-04 | deleteBudget_DeletesCorrectEndpoint | id            | DELETE /api/budgets/{id} |

### 5.4 alertService.test.ts

| TC-ID     | Test Name                          | Input         | Expected                     |
| --------- | ---------------------------------- | ------------- | ---------------------------- |
| FE-ALT-01 | getAlerts_ReturnsAlertArray        | mock response | Alert[]                      |
| FE-ALT-02 | dismissAlert_PutsToCorrectEndpoint | alertId       | PUT /api/alerts/{id}/dismiss |

### 5.5 BudgetForm.test.tsx

| TC-ID    | Test Name                            | Input             | Expected                          |
| -------- | ------------------------------------ | ----------------- | --------------------------------- |
| FE-BF-01 | renders_AmountAndPeriodFields        | —                 | inputs visible                    |
| FE-BF-02 | submit_WithEmptyAmount_ShowsError    | empty amount      | error message shown               |
| FE-BF-03 | submit_WithNegativeAmount_ShowsError | amount=-1         | error message shown               |
| FE-BF-04 | submit_WithValidData_CallsOnSubmit   | valid form        | onSubmit called with correct data |
| FE-BF-05 | submit_WithCategory_IncludesCategory | category selected | category in submitted data        |
| FE-BF-06 | submit_WithoutCategory_OmitsCategory | no category       | category undefined in data        |
| FE-BF-07 | submit_ShowsLoadingState             | slow submit       | button disabled during submit     |

### 5.6 TransactionList.test.tsx

| TC-ID    | Test Name                               | Input           | Expected                        |
| -------- | --------------------------------------- | --------------- | ------------------------------- |
| FE-TL-01 | renders_LoadingState                    | loading=true    | "Loading transactions..." shown |
| FE-TL-02 | renders_EmptyState                      | empty list      | empty state message shown       |
| FE-TL-03 | renders_TransactionRows                 | 2 transactions  | 2 rows in table                 |
| FE-TL-04 | filter_ByCategory_FiltersCorrectly      | category=Food   | only Food transactions shown    |
| FE-TL-05 | filter_BySource_FiltersCorrectly        | source=PLAID    | only Plaid transactions shown   |
| FE-TL-06 | editButton_NotShownForPlaidTransactions | PLAID source    | Edit button absent              |
| FE-TL-07 | deleteButton_TriggersConfirmDialog      | click Delete    | confirm dialog shown            |
| FE-TL-08 | total_CalculatesCorrectly               | amounts=[50,30] | total=$80.00 shown              |

---

## 6. Running the Tests

### Backend

```bash
cd Masarifi-backend
mvn test
```

### Frontend

```bash
cd Masarifi-frontend
npm test
```

---

## 7. Coverage Targets

| Layer                    | Target                        |
| ------------------------ | ----------------------------- |
| Backend service layer    | ≥ 80% line coverage           |
| Backend controller layer | ≥ 90% endpoint coverage       |
| Frontend service layer   | 100% method coverage          |
| Frontend components      | Key user interactions covered |
