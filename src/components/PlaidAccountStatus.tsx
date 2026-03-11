import React, { useState, useEffect } from 'react';
import { PlaidAccount } from '../types/plaid';
import plaidService from '../services/plaidService';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';

interface PlaidAccountStatusProps {
  refreshTrigger?: number;
  onUnlink?: () => void;
}

export const PlaidAccountStatus: React.FC<PlaidAccountStatusProps> = ({ 
  refreshTrigger = 0,
  onUnlink 
}) => {
  const [accounts, setAccounts] = useState<PlaidAccount[]>([]);
  const [linked, setLinked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unlinking, setUnlinking] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, [refreshTrigger]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await plaidService.getLinkedAccounts();
      setAccounts(response.accounts.filter(a => a.isActive));
      setLinked(response.linked);
    } catch (err: any) {
      setError('Failed to load linked accounts. Please try again.');
      console.error('Error fetching linked accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    if (!window.confirm('Are you sure you want to unlink your bank account? Previously imported transactions will be retained.')) {
      return;
    }

    try {
      setUnlinking(true);
      setError(null);
      await plaidService.unlinkAccount();
      await fetchAccounts();
      if (onUnlink) {
        onUnlink();
      }
    } catch (err: any) {
      setError('Failed to unlink account. Please try again.');
      console.error('Error unlinking account:', err);
    } finally {
      setUnlinking(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="small" message="Loading account status..." />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  const activeAccounts = accounts.filter(a => a.isActive);

  if (!linked || activeAccounts.length === 0) {
    return null;
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Linked Bank Accounts</h3>
      
      {activeAccounts.map(account => (
        <div key={account.id} style={styles.accountCard}>
          <div style={styles.accountInfo}>
            <div style={styles.institutionName}>
              🏦 {account.institutionName}
            </div>
            
            {account.accountName && (
              <div style={styles.accountDetail}>
                <strong>Account:</strong> {account.accountName}
              </div>
            )}
            
            {account.accountMask && (
              <div style={styles.accountDetail}>
                <strong>Account Number:</strong> ****{account.accountMask}
              </div>
            )}
            
            <div style={styles.accountDetail}>
              <strong>Linked:</strong> {new Date(account.linkedAt).toLocaleDateString()}
            </div>
            
            {account.lastSyncAt && (
              <div style={styles.accountDetail}>
                <strong>Last Sync:</strong> {new Date(account.lastSyncAt).toLocaleString()}
              </div>
            )}
            
          </div>
          
          <button
            onClick={handleUnlink}
            disabled={unlinking}
            style={{
              ...styles.unlinkButton,
              ...(unlinking ? styles.unlinkButtonDisabled : {})
            }}
          >
            {unlinking ? 'Unlinking...' : 'Unlink Account'}
          </button>
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
    marginBottom: '20px'
  },
  title: {
    marginTop: 0,
    marginBottom: '15px',
    fontSize: '18px',
    fontWeight: 600
  },
  accountCard: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '6px',
    border: '1px solid #e0e0e0',
    marginBottom: '10px'
  },
  accountInfo: {
    marginBottom: '15px'
  },
  institutionName: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333'
  },
  accountDetail: {
    fontSize: '14px',
    marginBottom: '5px',
    color: '#666'
  },
  statusBadge: {
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  unlinkButton: {
    padding: '8px 16px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'background-color 0.2s'
  },
  unlinkButtonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed'
  }
};

export default PlaidAccountStatus;
