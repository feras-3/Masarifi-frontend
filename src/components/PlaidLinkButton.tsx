import React, { useState } from 'react'
import plaidService from '../services/plaidService'

const SANDBOX_INSTITUTIONS = [
  { id: 'ins_109508', name: 'Chase' },
  { id: 'ins_109509', name: 'Bank of America' },
  { id: 'ins_109510', name: 'Wells Fargo' }
]

export interface PlaidLinkButtonProps {
  onSuccess?: (institutionName: string) => void
  onExit?: () => void
}

const PlaidLinkButton: React.FC<PlaidLinkButtonProps> = ({ onSuccess }) => {
  const [step, setStep] = useState<'idle' | 'loading' | 'done' | 'error'>(
    'idle'
  )
  const [selectedId, setSelectedId] = useState(SANDBOX_INSTITUTIONS[0].id)
  const [customId, setCustomId] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [linkedBank, setLinkedBank] = useState<string | null>(null)

  const handleLink = async () => {
    const institutionId = useCustom ? customId.trim() : selectedId
    if (!institutionId) {
      setErrorMsg('Please enter an institution ID.')
      setStep('error')
      return
    }
    setStep('loading')
    setErrorMsg(null)

    try {
      const { publicToken } =
        await plaidService.createPublicToken(institutionId)
      const result = await plaidService.exchangePublicToken(publicToken)

      const institutionName =
        result.institutionName ||
        SANDBOX_INSTITUTIONS.find((i) => i.id === institutionId)?.name ||
        institutionId ||
        'Bank'

      setLinkedBank(institutionName)
      setStep('done')
      if (onSuccess) onSuccess(institutionName)
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to link bank account. Please try again.'
      setErrorMsg(msg)
      setStep('error')
    }
  }

  if (step === 'done') {
    return (
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: '#f0fff4',
          border: '1.5px solid #c3e6cb',
          borderRadius: '10px',
          color: '#155724',
          fontSize: '14px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}
      >
        <span style={{ fontSize: '20px' }}>✓</span>
        <span>Successfully linked {linkedBank}</span>
      </div>
    )
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    backgroundColor: 'white',
    transition: 'border-color 0.2s ease',
    outline: 'none'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {step === 'error' && errorMsg && (
        <div
          style={{
            padding: '14px 16px',
            backgroundColor: '#fff0f0',
            border: '1.5px solid #ffcdd2',
            borderRadius: '8px',
            color: '#c62828',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <label
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#2c3e50'
            }}
          >
            {useCustom ? 'Institution ID' : 'Select Bank'}
          </label>
          <button
            type="button"
            onClick={() => setUseCustom((v) => !v)}
            disabled={step === 'loading'}
            style={{
              background: 'none',
              border: 'none',
              color: '#2196F3',
              fontSize: '13px',
              fontWeight: 600,
              cursor: step === 'loading' ? 'not-allowed' : 'pointer',
              padding: '4px 8px',
              textDecoration: 'underline',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (step !== 'loading') {
                e.currentTarget.style.color = '#1976d2'
              }
            }}
            onMouseLeave={(e) => {
              if (step !== 'loading') {
                e.currentTarget.style.color = '#2196F3'
              }
            }}
          >
            {useCustom ? 'Pick from list' : 'Enter custom ID'}
          </button>
        </div>
        {useCustom ? (
          <input
            type="text"
            value={customId}
            onChange={(e) => setCustomId(e.target.value)}
            disabled={step === 'loading'}
            placeholder="e.g. ins_109508"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#2196F3')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#e0e0e0')}
          />
        ) : (
          <select
            id="institution-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={step === 'loading'}
            style={{
              ...inputStyle,
              cursor: step === 'loading' ? 'not-allowed' : 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 14px center',
              paddingRight: '40px'
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#2196F3')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#e0e0e0')}
          >
            {SANDBOX_INSTITUTIONS.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <button
        onClick={handleLink}
        disabled={step === 'loading'}
        style={{
          padding: '14px 24px',
          backgroundColor: step === 'loading' ? '#ccc' : '#2c3e50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: 600,
          cursor: step === 'loading' ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: step === 'loading' ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
          minHeight: '48px'
        }}
        onMouseEnter={(e) => {
          if (step !== 'loading') {
            e.currentTarget.style.backgroundColor = '#1a252f'
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'
          }
        }}
        onMouseLeave={(e) => {
          if (step !== 'loading') {
            e.currentTarget.style.backgroundColor = '#2c3e50'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
          }
        }}
      >
        {step === 'loading' ? (
          <>
            <div
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}
            ></div>
            <span>Linking...</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: '18px' }}>🏦</span>
            <span>Link Bank Account</span>
          </>
        )}
      </button>
    </div>
  )
}

export default PlaidLinkButton
