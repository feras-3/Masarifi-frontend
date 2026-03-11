import React, { useState } from 'react';
import plaidService from '../services/plaidService';

// Sandbox institution IDs from API guide
const SANDBOX_INSTITUTIONS = [
  { id: 'ins_109508', name: 'Chase' },
  { id: 'ins_109509', name: 'Bank of America' },
  { id: 'ins_109510', name: 'Wells Fargo' },
];

export interface PlaidLinkButtonProps {
  onSuccess?: (institutionName: string) => void;
  onExit?: () => void;
}

const PlaidLinkButton: React.FC<PlaidLinkButtonProps> = ({ onSuccess }) => {
  const [step, setStep] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [selectedId, setSelectedId] = useState(SANDBOX_INSTITUTIONS[0].id);
  const [customId, setCustomId] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [linkedBank, setLinkedBank] = useState<string | null>(null);

  const handleLink = async () => {
    const institutionId = useCustom ? customId.trim() : selectedId;
    if (!institutionId) {
      setErrorMsg('Please enter an institution ID.');
      setStep('error');
      return;
    }
    setStep('loading');
    setErrorMsg(null);

    try {
      // Step 1: Create sandbox public token (POST /api/plaid/public-token)
      const { publicToken } = await plaidService.createPublicToken(institutionId);

      // Step 2: Exchange for access token (POST /api/plaid/exchange-token)
      const result = await plaidService.exchangePublicToken(publicToken);

      const institutionName =
        result.institutionName ||
        SANDBOX_INSTITUTIONS.find(i => i.id === institutionId)?.name ||
        institutionId ||
        'Bank';

      setLinkedBank(institutionName);
      setStep('done');
      if (onSuccess) onSuccess(institutionName);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to link bank account. Please try again.';
      setErrorMsg(msg);
      setStep('error');
    }
  };

  if (step === 'done') {
    return (
      <div style={{
        padding: '14px',
        backgroundColor: '#f0fff4',
        border: '1px solid #c3e6cb',
        borderRadius: '8px',
        color: '#155724',
        fontSize: '14px',
        fontWeight: 500
      }}>
        ✓ Successfully linked {linkedBank}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {step === 'error' && errorMsg && (
        <div style={{
          padding: '12px 14px',
          backgroundColor: '#fff0f0',
          border: '1px solid #ffcdd2',
          borderRadius: '8px',
          color: '#c62828',
          fontSize: '13px'
        }}>
          {errorMsg}
        </div>
      )}

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#444' }}>
            {useCustom ? 'Institution ID' : 'Select Bank'}
          </label>
          <button
            type="button"
            onClick={() => setUseCustom(v => !v)}
            disabled={step === 'loading'}
            style={{
              background: 'none',
              border: 'none',
              color: '#0f3460',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline'
            }}
          >
            {useCustom ? 'Pick from list' : 'Enter custom ID'}
          </button>
        </div>
        {useCustom ? (
          <input
            type="text"
            value={customId}
            onChange={e => setCustomId(e.target.value)}
            disabled={step === 'loading'}
            placeholder="e.g. ins_109508"
            style={{
              width: '100%',
              padding: '9px 12px',
              border: '1.5px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box',
              backgroundColor: 'white',
            }}
          />
        ) : (
          <select
            id="institution-select"
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            disabled={step === 'loading'}
            style={{
              width: '100%',
              padding: '9px 12px',
              border: '1.5px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            {SANDBOX_INSTITUTIONS.map(inst => (
              <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
          </select>
        )}
      </div>

      <button
        onClick={handleLink}
        disabled={step === 'loading'}
        style={{
          padding: '11px 20px',
          backgroundColor: step === 'loading' ? '#7986a3' : '#0f3460',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: step === 'loading' ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s'
        }}
      >
        {step === 'loading' ? 'Linking...' : '🏦 Link Bank Account'}
      </button>
    </div>
  );
};

export default PlaidLinkButton;
