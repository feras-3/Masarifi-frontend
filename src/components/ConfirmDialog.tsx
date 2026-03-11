import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  isDanger?: boolean
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDanger = false
}) => {
  const { isDarkMode } = useTheme()

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: isDarkMode ? '#16213e' : 'white',
          padding: '28px 24px',
          borderRadius: '12px',
          maxWidth: '450px',
          width: '100%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          animation: 'slideIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            marginBottom: '20px'
          }}
        >
          <div
            style={{
              fontSize: '32px',
              lineHeight: 1,
              flexShrink: 0
            }}
          >
            {isDanger ? '⚠️' : 'ℹ️'}
          </div>
          <div style={{ flex: 1 }}>
            <h3
              style={{
                margin: '0 0 12px 0',
                fontSize: '20px',
                fontWeight: 700,
                color: isDarkMode ? '#e0e0e0' : '#2c3e50'
              }}
            >
              {title}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: '15px',
                lineHeight: '1.6',
                color: isDarkMode ? '#b0b0b0' : '#666'
              }}
            >
              {message}
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            marginTop: '24px'
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: isDarkMode ? '#0f3460' : '#f5f5f5',
              color: isDarkMode ? '#e0e0e0' : '#333',
              border: `1.5px solid ${isDarkMode ? '#2c3e50' : '#e0e0e0'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'all 0.2s ease',
              minWidth: '100px',
              minHeight: '44px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode
                ? '#1a4d7a'
                : '#e0e0e0'
              e.currentTarget.style.borderColor = isDarkMode
                ? '#3d5a80'
                : '#ccc'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode
                ? '#0f3460'
                : '#f5f5f5'
              e.currentTarget.style.borderColor = isDarkMode
                ? '#2c3e50'
                : '#e0e0e0'
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              backgroundColor: isDanger ? '#f44336' : '#2c3e50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'all 0.2s ease',
              minWidth: '100px',
              minHeight: '44px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDanger
                ? '#da190b'
                : '#1a252f'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDanger
                ? '#f44336'
                : '#2c3e50'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
