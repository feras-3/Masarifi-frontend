import React, { useState } from 'react';
import { authService } from '../services/authService';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const validateForm = (): boolean => {
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await authService.register({ username: username.trim(), password });
      onSwitchToLogin();
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data.message || 'Registration failed. Please try again.');
      } else if (err.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    fontSize: '15px',
    border: '1.5px solid #e0e0e0',
    borderRadius: '8px',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#1a1a2e',
    transition: 'border-color 0.2s',
    backgroundColor: isLoading ? '#f5f5f5' : 'white',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#444',
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '40px',
      boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
    }}>
      <h2 style={{ margin: '0 0 28px', fontSize: '22px', fontWeight: 700, color: '#1a1a2e' }}>
        Create an account
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="reg-username" style={labelStyle}>Username</label>
          <input
            id="reg-username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={isLoading}
            placeholder="Choose a username"
            style={inputStyle}
            onFocus={e => e.currentTarget.style.borderColor = '#0f3460'}
            onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="reg-password" style={labelStyle}>Password</label>
          <input
            id="reg-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={isLoading}
            placeholder="Create a password"
            style={inputStyle}
            onFocus={e => e.currentTarget.style.borderColor = '#0f3460'}
            onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label htmlFor="reg-confirm" style={labelStyle}>Confirm Password</label>
          <input
            id="reg-confirm"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            placeholder="Repeat your password"
            style={inputStyle}
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
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </button>

        <p style={{ margin: 0, textAlign: 'center', fontSize: '14px', color: '#666' }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
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
            Sign In
          </button>
        </p>
      </form>
    </div>
  );
};
