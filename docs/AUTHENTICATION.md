# Authentication System

## Overview

The React front-end authentication system provides secure user authentication with JWT token management. It includes:

- **AuthContext**: React context for managing authentication state
- **LoginForm**: Component for user login
- **API Client**: Axios instance with automatic token injection and 401 error handling

## Components

### AuthContext

Provides authentication state and methods throughout the application.

**Usage:**

```tsx
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Wrap your app with AuthProvider
<AuthProvider>
  <App />
</AuthProvider>

// Use the hook in components
const { token, login, logout, isAuthenticated } = useAuth();
```

**API:**

- `token: string | null` - Current authentication token
- `login(token: string): void` - Store token and mark user as authenticated
- `logout(): void` - Remove token and mark user as unauthenticated
- `isAuthenticated: boolean` - Whether user is currently authenticated

### LoginForm

A form component for user authentication.

**Usage:**

```tsx
import { LoginForm } from './components/LoginForm';

<LoginForm onLoginSuccess={() => console.log('Logged in!')} />
```

**Props:**

- `onLoginSuccess?: () => void` - Optional callback called after successful login

**Features:**

- Client-side validation for username and password
- Error message display for authentication failures
- Network error handling
- Loading state during authentication

### API Client

Axios instance configured with authentication interceptors.

**Usage:**

```tsx
import apiClient from './services/apiClient';

// Make authenticated requests
const response = await apiClient.get('/api/transactions');
const data = await apiClient.post('/api/budgets', { amount: 1000 });
```

**Features:**

- Automatically includes `Authorization: Bearer <token>` header on all requests
- Handles 401 errors by clearing token and redirecting to login
- Configurable base URL via `VITE_API_BASE_URL` environment variable

## Configuration

Create a `.env` file in the project root:

```
VITE_API_BASE_URL=http://localhost:8080
```

## Token Storage

Authentication tokens are stored in `localStorage` with the key `auth_token`. The token persists across browser sessions and is automatically restored when the application loads.

## Security Considerations

1. **HTTPS**: Always use HTTPS in production to protect tokens in transit
2. **Token Expiration**: The backend should implement token expiration
3. **XSS Protection**: Ensure proper Content Security Policy headers
4. **CSRF Protection**: Consider implementing CSRF tokens for state-changing operations

## Testing

The authentication system includes comprehensive unit tests:

- `AuthContext.test.tsx` - Tests for authentication context
- `LoginForm.test.tsx` - Tests for login form component
- `apiClient.test.ts` - Tests for API client configuration

Run tests with:

```bash
npm test
```

## Requirements Validated

This implementation validates the following requirements:

- **Requirement 9.2**: User authentication with valid credentials
- **Requirement 9.3**: Error handling for invalid credentials
- **Requirement 9.4**: Token validation on each request
- **Requirement 9.5**: Handling of invalid/expired tokens
- **Requirement 11.4**: Error message display to users
