import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { AuthDebug } from './components/AuthDebug';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '40px', color: '#c0392b', fontFamily: 'monospace' }}>
          <h2>Something went wrong</h2>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {(this.state.error as Error).message}
          </pre>
          <button onClick={() => window.location.href = '/'}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Set to true to enable debug panel
const SHOW_DEBUG = true;

const AppContent: React.FC = () => {
  const { isAuthenticated, logout, username } = useAuth();

  console.log('AppContent render - isAuthenticated:', isAuthenticated, 'username:', username);

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px' }}>
        <h1>Expense Tracker</h1>
        <LoginForm />
        {SHOW_DEBUG && <AuthDebug />}
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        position: 'absolute',
        top: '15px',
        right: '20px',
        zIndex: 1000
      }}>
        <button 
          onClick={logout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Logout
        </button>
      </div>
      
      <Dashboard />
      {SHOW_DEBUG && <AuthDebug />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
