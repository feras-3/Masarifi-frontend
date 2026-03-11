import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

interface LoginFormProps {
  onLoginSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const validateForm = (): boolean => {
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login({
        username,
        password,
      });

      login(response.token, response.username || username);
      
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data.message || 'Invalid credentials');
      } else if (err.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '40px',
      boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
    }}>
      <h2 style={{ margin: '0 0 28px', fontSize: '22px', fontWeight: 700, color: '#1a1a2e' }}>
        Sign in to your account
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="username" style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#444'
          }}>
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            placeholder="Enter your username"
            style={{
              width: '100%',
              padding: '11px 14px',
              fontSize: '15px',
              border: '1.5px solid #e0e0e0',
              borderRadius: '8px',
              outline: 'none',
              boxSizing: 'border-box',
              color: '#1a1a2e',
              transition: 'border-color 0.2s',
              backgroundColor: isLoading ? '#f5f5f5' : 'white'
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#0f3460'}
            onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label htmlFor="password" style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#444'
          }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            placeholder="Enter your password"
            style={{
              width: '100%',
              padding: '11px 14px',
              fontSize: '15px',
              border: '1.5px solid #e0e0e0',
              borderRadius: '8px',
              outline: 'none',
              boxSizing: 'border-box',
              color: '#1a1a2e',
              transition: 'border-color 0.2s',
              backgroundColor: isLoading ? '#f5f5f5' : 'white'
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#0f3460'}
            onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'}
          />
        </div>

        {error && (
          <div style={{
            marginBottom: '20px',
            padding: '12px 14px',
            backgroundColor: '#fff0f0',
            border: '1px solid #ffcdd2',
            borderRadius: '8px',
            color: '#c62828',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '13px',
            backgroundColor: isLoading ? '#7986a3' : '#0f3460',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            letterSpacing: '0.3px',
            marginBottom: '16px'
          }}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

        {onSwitchToRegister && (
          <p style={{ margin: 0, textAlign: 'center', fontSize: '14px', color: '#666' }}>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              style={{
                background: 'none',
                border: 'none',
                color: '#0f3460',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '14px',
                padding: 0
              }}
            >
              Sign Up
            </button>
          </p>
        )}
      </form>
    </div>
  );
};
