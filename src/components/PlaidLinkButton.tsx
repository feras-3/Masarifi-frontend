import React, { useCallback, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import plaidService from '../services/plaidService';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import { useApiRequest } from '../hooks/useApiRequest';

export interface PlaidLinkButtonProps {
  onSuccess?: (institutionName: string) => void;
  onExit?: () => void;
}

const PlaidLinkButton: React.FC<PlaidLinkButtonProps> = ({ onSuccess, onExit }) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    loading: fetchingToken,
    error: tokenError,
    execute: fetchLinkToken
  } = useApiRequest(plaidService.createLinkToken);

  const {
    loading: exchanging,
    error: exchangeError,
    execute: exchangeToken
  } = useApiRequest(plaidService.exchangePublicToken);

  const handleOnSuccess = useCallback(
    async (publicToken: string) => {
      const result = await exchangeToken(publicToken);
      
      if (result) {
        setSuccessMessage(`Successfully linked ${result.institutionName}`);
        if (onSuccess) {
          onSuccess(result.institutionName);
        }
      }
    },
    [exchangeToken, onSuccess]
  );

  const handleOnExit = useCallback(() => {
    if (onExit) {
      onExit();
    }
  }, [onExit]);

  const config = {
    token: linkToken,
    onSuccess: handleOnSuccess,
    onExit: handleOnExit,
  };

  const { open, ready } = usePlaidLink(config);

  const handleClick = async () => {
    if (!linkToken) {
      const response = await fetchLinkToken();
      if (response) {
        setLinkToken(response.linkToken);
        // Open will be called automatically when ready becomes true
      }
    } else {
      open();
    }
  };

  // Auto-open when link token is ready
  React.useEffect(() => {
    if (linkToken && ready) {
      open();
    }
  }, [linkToken, ready, open]);

  const error = tokenError || exchangeError;
  const loading = fetchingToken || exchanging;

  return (
    <div style={styles.container}>
      {successMessage && (
        <div style={styles.successMessage}>
          ✓ {successMessage}
        </div>
      )}
      
      {error && <ErrorMessage error={error} />}
      
      {loading ? (
        <LoadingSpinner size="small" message="Connecting to bank..." />
      ) : (
        <button
          onClick={handleClick}
          disabled={loading || (!!linkToken && !ready)}
          style={{
            ...styles.button,
            ...(loading || (!!linkToken && !ready) ? styles.buttonDisabled : {})
          }}
        >
          {linkToken && !ready ? 'Preparing...' : 'Link Bank Account'}
        </button>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  button: {
    backgroundColor: '#00d4ff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  successMessage: {
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    borderRadius: '4px',
    padding: '12px',
    color: '#155724',
    fontWeight: 500,
  },
};

export default PlaidLinkButton;
