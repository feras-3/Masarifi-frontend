import React from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Debug component to display authentication state
 * Remove this component in production
 */
export const AuthDebug: React.FC = () => {
  const { token, username, isAuthenticated } = useAuth();

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      left: '10px',
      padding: '10px',
      backgroundColor: '#f0f0f0',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <h4 style={{ margin: '0 0 5px 0' }}>Auth Debug</h4>
      <div>Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</div>
      <div>Username: {username || 'None'}</div>
      <div>Token: {token ? `${token.substring(0, 20)}...` : 'None'}</div>
      <div>LocalStorage Token: {localStorage.getItem('auth_token') ? '✅' : '❌'}</div>
      <div>LocalStorage Username: {localStorage.getItem('auth_username') || 'None'}</div>
    </div>
  );
};
