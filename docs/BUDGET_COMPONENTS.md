# Budget Management Components

This document describes the budget management components implemented for the expense tracking application.

## Components

### 1. BudgetForm

A form component for creating or updating budgets.

**Props:**
- `onSubmit: (budget: BudgetRequest) => Promise<void>` - Callback function called when form is submitted
- `initialData?: Partial<BudgetRequest>` - Optional initial data to populate the form
- `submitLabel?: string` - Optional custom label for submit button (default: "Set Budget")

**Features:**
- Client-side validation for amount (numeric, max 2 decimals, greater than zero)
- Period selection using month input
- Inline validation error display
- Disabled submit button when validation errors exist
- Loading state during submission

**Example Usage:**
```tsx
import { BudgetForm } from './components/BudgetForm';
import { budgetService } from './services/budgetService';

function MyComponent() {
  const handleSubmit = async (budgetData) => {
    await budgetService.createBudget(budgetData);
  };

  return <BudgetForm onSubmit={handleSubmit} />;
}
```

### 2. BudgetSummary

A component that displays the current budget status with visual indicators.

**Props:**
- `refreshTrigger?: number` - Optional trigger to refetch budget data when changed

**Features:**
- Displays budget amount, spent amount, and remaining balance
- Visual progress bar showing percentage used
- Warning color (orange) when spending exceeds 80% of budget
- Critical color (red) when spending exceeds 100% of budget
- Warning messages for high spending
- Handles loading and error states
- Shows message when no budget exists

**Example Usage:**
```tsx
import { BudgetSummary } from './components/BudgetSummary';

function MyComponent() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleBudgetCreated = () => {
    setRefreshTrigger(prev => prev + 1); // Trigger refresh
  };

  return <BudgetSummary refreshTrigger={refreshTrigger} />;
}
```

### 3. BudgetManagement

A complete budget management page that combines BudgetForm and BudgetSummary.

**Features:**
- Displays current budget status
- Provides form to create new budget
- Shows success/error messages
- Automatically refreshes summary after budget creation

**Example Usage:**
```tsx
import { BudgetManagement } from './components/BudgetManagement';

function App() {
  return (
    <div>
      <BudgetManagement />
    </div>
  );
}
```

## Services

### budgetService

Service for interacting with budget API endpoints.

**Methods:**
- `createBudget(data: BudgetRequest): Promise<Budget>` - Create a new budget
- `getCurrentBudgetStatus(): Promise<BudgetStatus>` - Get current budget status
- `updateBudget(id: string, amount: number): Promise<Budget>` - Update existing budget

**Example Usage:**
```tsx
import { budgetService } from './services/budgetService';

// Create budget
const budget = await budgetService.createBudget({
  amount: 2000,
  period: '2024-01'
});

// Get current status
const status = await budgetService.getCurrentBudgetStatus();
console.log(status.remaining); // Remaining balance
```

## Types

### BudgetRequest
```typescript
interface BudgetRequest {
  amount: number;
  period: string; // Format: YYYY-MM
}
```

### BudgetStatus
```typescript
interface BudgetStatus {
  budgetId: string;
  amount: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  period: string;
}
```

### Budget
```typescript
interface Budget {
  id: string;
  userId: string;
  amount: number;
  period: string;
  createdAt: string;
  updatedAt: string;
}
```

## Validation Rules

### Amount Validation
- Must be a valid number
- Must be greater than zero
- Can have at most 2 decimal places
- Validation errors displayed inline

### Period Validation
- Must be provided
- Uses HTML5 month input for consistent format

## Visual Indicators

### Budget Status Colors
- **Green (#4CAF50)**: Spending is below 80% of budget
- **Orange (#ff9800)**: Spending is between 80% and 100% of budget
- **Red (#f44336)**: Spending exceeds 100% of budget

### Progress Bar
- Shows percentage of budget used
- Color changes based on spending level
- Smooth transition animation

## Integration with Backend

The components expect the following API endpoints to be available:

- `POST /api/budgets` - Create new budget
- `GET /api/budgets/current` - Get current budget status
- `PUT /api/budgets/{id}` - Update existing budget

All requests include authentication token from localStorage.

## Testing

Both components have comprehensive unit tests covering:
- Form validation
- Error handling
- Loading states
- Visual indicators
- User interactions
- API integration

Run tests with:
```bash
npm test -- BudgetForm.test.tsx BudgetSummary.test.tsx --run
```
