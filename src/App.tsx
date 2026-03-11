import React, { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LoginForm } from './components/LoginForm'
import { RegisterForm } from './components/RegisterForm'
import { Dashboard } from './components/Dashboard'
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div
          style={{ padding: '40px', color: '#c0392b', fontFamily: 'monospace' }}
        >
          <h2>Something went wrong</h2>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {(this.state.error as Error).message}
          </pre>
          <button onClick={() => (window.location.href = '/')}>Reload</button>
        </div>
      )
    }
    return this.props.children
  }
}

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const [page, setPage] = useState<'login' | 'register'>('login')

  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background:
            'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>💰</div>
            <h1
              style={{
                color: 'white',
                margin: 0,
                fontSize: '28px',
                fontWeight: 700,
                letterSpacing: '-0.5px'
              }}
            >
              Masarifi
            </h1>
            <p
              style={{
                color: 'rgba(255,255,255,0.55)',
                margin: '8px 0 0',
                fontSize: '15px'
              }}
            >
              Track your spending, own your budget
            </p>
          </div>
          {page === 'login' ? (
            <LoginForm onSwitchToRegister={() => setPage('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setPage('login')} />
          )}
        </div>
      </div>
    )
  }

  return <Dashboard />
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
