# Troubleshooting: Blank Page After Login

## Issue

After logging in, the dashboard briefly appears and then shows a blank page.

## What I Fixed

### 1. Updated AuthContext

- Added `username` to the auth state
- Added `isLoading` state to prevent flash during initialization
- Updated `login()` to accept both `token` and `username`
- Added loading screen while checking localStorage

### 2. Updated LoginForm

- Changed from using `apiClient` directly to using `authService`
- Now properly passes both `token` and `username` to the login function

### 3. Added Debug Logging

- Added console.log in AppContent to track authentication state

## How to Debug

### Step 1: Open Browser Console

Press F12 and check the Console tab for:

- "AppContent render - isAuthenticated: true/false username: ..."
- Any error messages

### Step 2: Check Network Tab

1. Open Network tab in DevTools
2. Try logging in
3. Look for the `/api/auth/login` request
4. Check if it returns `{ token: "...", username: "..." }`

### Step 3: Check localStorage

In Console, run:

```javascript
localStorage.getItem('auth_token')
localStorage.getItem('auth_username')
```

Both should have values after login.

### Step 4: Check for Errors

Look for:

- 401 errors (authentication failed)
- 404 errors (API endpoint not found)
- CORS errors (backend not allowing frontend origin)
- Network errors (backend not running)

## Common Causes & Solutions

### Cause 1: Backend Not Running

**Symptom:** Network errors, "Failed to fetch"

**Solution:**

```bash
# Make sure backend is running on port 8080
curl http://localhost:8080/api/auth/login
```

### Cause 2: CORS Issues

**Symptom:** CORS policy error in console

**Solution:** Backend needs to allow `http://localhost:5173` (or your frontend port)

Add to Spring Boot backend:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowCredentials(true);
    }
}
```

### Cause 3: Wrong API URL

**Symptom:** 404 errors

**Solution:** Check `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Restart dev server after changing .env:

```bash
npm run dev
```

### Cause 4: Token Not Being Saved

**Symptom:** Redirects back to login immediately

**Solution:** Check if localStorage is working:

```javascript
// In browser console
localStorage.setItem('test', 'value')
localStorage.getItem('test') // Should return 'value'
```

### Cause 5: Dashboard Component Error

**Symptom:** Blank page, error in console

**Solution:** Check console for component errors. Common issues:

- Missing dependencies
- API calls failing
- Type errors

## Testing the Fix

### Test 1: Fresh Login

1. Clear localStorage: `localStorage.clear()`
2. Refresh page
3. Login with valid credentials
4. Should see dashboard without blank page

### Test 2: Page Refresh

1. Login successfully
2. Refresh the page (F5)
3. Should stay logged in and show dashboard

### Test 3: Logout and Login

1. Click Logout button
2. Should see login form
3. Login again
4. Should see dashboard

## Verification Checklist

- [ ] Backend is running on port 8080
- [ ] `.env` file has correct API URL
- [ ] No CORS errors in console
- [ ] Login request returns `{ token, username }`
- [ ] Token is saved in localStorage
- [ ] Username is saved in localStorage
- [ ] No errors in browser console
- [ ] Dashboard renders without blank page

## Still Having Issues?

### Enable Detailed Logging

Add this to `src/contexts/AuthContext.tsx`:

```typescript
useEffect(() => {
  console.log('AuthProvider: Checking localStorage...')
  const storedToken = localStorage.getItem(TOKEN_KEY)
  const storedUsername = localStorage.getItem(USERNAME_KEY)
  console.log('AuthProvider: Found token:', !!storedToken)
  console.log('AuthProvider: Found username:', storedUsername)
  if (storedToken) {
    setToken(storedToken)
    setUsername(storedUsername)
  }
  setIsLoading(false)
  console.log('AuthProvider: Initialization complete')
}, [])
```

### Check API Response Format

The backend MUST return this exact format:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "testuser"
}
```

If it returns something different, update the `AuthResponse` type in `src/types/auth.ts`.

## Quick Fix: Remove React.StrictMode

React.StrictMode causes double-rendering in development. Try removing it temporarily:

In `src/main.tsx`:

```typescript
// Before
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// After (temporary test)
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
```

If this fixes it, the issue is with component lifecycle, not authentication.

## Contact Points

If none of these solutions work:

1. Share the browser console output
2. Share the Network tab showing the login request/response
3. Share any error messages
4. Confirm backend is returning the correct response format
