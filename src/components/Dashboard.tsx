import React, { useState, useEffect } from 'react'
import { BudgetSummary } from './BudgetSummary'
import { AlertBanner } from './AlertBanner'
import { TransactionList } from './TransactionList'
import PlaidAccountStatus from './PlaidAccountStatus'
import PlaidLinkButton from './PlaidLinkButton'
import SyncTransactionsButton from './SyncTransactionsButton'
import { TransactionForm } from './TransactionForm'
import { BudgetForm } from './BudgetForm'
import { TransactionEditModal } from './TransactionEditModal'
import { Transaction, TransactionRequest } from '../types/transaction'
import { BudgetRequest } from '../types/budget'
import { transactionService } from '../services/transactionService'
import { budgetService } from '../services/budgetService'
import plaidService from '../services/plaidService'
import { useAuth } from '../contexts/AuthContext'

type View = 'dashboard' | 'add-transaction' | 'manage-budget'

export const Dashboard: React.FC = () => {
  const { logout, username } = useAuth()
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)
  const [hasLinkedAccount, setHasLinkedAccount] = useState(false)
  const [checkingAccount, setCheckingAccount] = useState(true)

  useEffect(() => {
    checkLinkedAccount()
  }, [])

  const checkLinkedAccount = async () => {
    try {
      const response = await plaidService.getLinkedAccounts()
      setHasLinkedAccount(response.linked)
    } catch (err) {
      console.error('Error checking linked accounts:', err)
      setHasLinkedAccount(false)
    } finally {
      setCheckingAccount(false)
    }
  }

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleTransactionSubmit = async (request: TransactionRequest) => {
    await transactionService.createTransaction(request)
    handleRefresh()
    setCurrentView('dashboard')
  }

  const handleBudgetSubmit = async (request: BudgetRequest) => {
    await budgetService.createBudget(request)
    handleRefresh()
    setCurrentView('dashboard')
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
  }

  const handleDelete = async (id: string) => {
    try {
      await transactionService.deleteTransaction(id)
      handleRefresh()
    } catch (err) {
      console.error('Error deleting transaction:', err)
      throw err
    }
  }

  const handleEditSave = async (id: string, data: TransactionRequest) => {
    await transactionService.updateTransaction(id, data)
    setEditingTransaction(null)
    handleRefresh()
  }

  const handleEditClose = () => {
    setEditingTransaction(null)
  }

  const handlePlaidLinkSuccess = () => {
    setHasLinkedAccount(true)
    handleRefresh()
  }

  const handleUnlink = () => {
    setHasLinkedAccount(false)
    handleRefresh()
  }

  const handleSyncComplete = (newCount: number) => {
    if (newCount > 0) {
      handleRefresh()
    }
  }

  const renderNavigation = () => (
    <nav style={styles.nav}>
      <div style={styles.navBrand}>💰 Expense Tracker</div>
      <div style={styles.navButtons}>
        <button
          onClick={() => setCurrentView('dashboard')}
          style={{
            ...styles.navButton,
            ...(currentView === 'dashboard' ? styles.navButtonActive : {})
          }}
          onMouseEnter={(e) => {
            if (currentView !== 'dashboard') {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
            }
          }}
          onMouseLeave={(e) => {
            if (currentView !== 'dashboard') {
              e.currentTarget.style.backgroundColor = 'transparent'
            }
          }}
        >
          Dashboard
        </button>
        <button
          onClick={() => setCurrentView('add-transaction')}
          style={{
            ...styles.navButton,
            ...(currentView === 'add-transaction' ? styles.navButtonActive : {})
          }}
          onMouseEnter={(e) => {
            if (currentView !== 'add-transaction') {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
            }
          }}
          onMouseLeave={(e) => {
            if (currentView !== 'add-transaction') {
              e.currentTarget.style.backgroundColor = 'transparent'
            }
          }}
        >
          Add Transaction
        </button>
        <button
          onClick={() => setCurrentView('manage-budget')}
          style={{
            ...styles.navButton,
            ...(currentView === 'manage-budget' ? styles.navButtonActive : {})
          }}
          onMouseEnter={(e) => {
            if (currentView !== 'manage-budget') {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
            }
          }}
          onMouseLeave={(e) => {
            if (currentView !== 'manage-budget') {
              e.currentTarget.style.backgroundColor = 'transparent'
            }
          }}
        >
          Manage Budget
        </button>
      </div>
      <div style={styles.navRight}>
        <span style={styles.navUsername} className="nav-username">
          👤 {username}
        </span>
        <button
          onClick={logout}
          style={styles.logoutButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.borderColor = 'white'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  )

  const renderDashboardView = () => (
    <div style={styles.dashboardGrid} className="dashboard-grid">
      <div style={styles.mainColumn}>
        <AlertBanner refreshTrigger={refreshTrigger} />
        <BudgetSummary refreshTrigger={refreshTrigger} />
        <TransactionList
          onEdit={handleEdit}
          onDelete={handleDelete}
          refreshTrigger={refreshTrigger}
        />
      </div>

      <div style={styles.sideColumn}>
        <div style={styles.plaidSection} className="plaid-section">
          <h3 style={styles.sectionTitle}>Bank Integration</h3>

          {checkingAccount ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              Loading...
            </div>
          ) : hasLinkedAccount ? (
            <>
              <PlaidAccountStatus
                refreshTrigger={refreshTrigger}
                onUnlink={handleUnlink}
              />
              <SyncTransactionsButton onSyncComplete={handleSyncComplete} />
            </>
          ) : (
            <div style={styles.linkPrompt}>
              <p style={styles.linkPromptText}>
                Link your bank account to automatically import transactions.
              </p>
              <PlaidLinkButton onSuccess={handlePlaidLinkSuccess} />
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderAddTransactionView = () => (
    <div style={styles.formContainer} className="form-container">
      <div style={styles.formHeader}>
        <h2 style={styles.formTitle} className="form-title">
          Add New Transaction
        </h2>
        <p style={styles.formSubtitle}>
          Record a manual transaction to track your spending
        </p>
      </div>
      <TransactionForm onSubmit={handleTransactionSubmit} />
      <button
        onClick={() => setCurrentView('dashboard')}
        style={styles.backButton}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#5a6268'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#6c757d'
        }}
      >
        ← Back to Dashboard
      </button>
    </div>
  )

  const renderManageBudgetView = () => (
    <div style={styles.formContainer} className="form-container">
      <div style={styles.formHeader}>
        <h2 style={styles.formTitle} className="form-title">
          Manage Budget
        </h2>
        <p style={styles.formSubtitle}>
          Set spending limits for categories or overall budget
        </p>
      </div>
      <BudgetForm onSubmit={handleBudgetSubmit} />
      <button
        onClick={() => setCurrentView('dashboard')}
        style={styles.backButton}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#5a6268'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#6c757d'
        }}
      >
        ← Back to Dashboard
      </button>
    </div>
  )

  return (
    <div style={styles.container}>
      {renderNavigation()}

      <main style={styles.main}>
        {currentView === 'dashboard' && renderDashboardView()}
        {currentView === 'add-transaction' && renderAddTransactionView()}
        {currentView === 'manage-budget' && renderManageBudgetView()}
      </main>

      {editingTransaction && (
        <TransactionEditModal
          transaction={editingTransaction}
          onSave={handleEditSave}
          onClose={handleEditClose}
        />
      )}
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  nav: {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
    flexWrap: 'wrap' as const,
    gap: '12px'
  },
  navBrand: {
    fontSize: '20px',
    fontWeight: 700,
    letterSpacing: '-0.5px'
  },
  navButtons: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap' as const
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  navUsername: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '14px',
    display: 'none' as const
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: 'white',
    border: '1.5px solid rgba(255,255,255,0.5)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'all 0.2s ease'
  },
  navButton: {
    backgroundColor: 'transparent',
    color: 'rgba(255,255,255,0.85)',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap' as const
  },
  navButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: 'white'
  },
  main: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px 16px'
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '24px'
  },
  mainColumn: {
    minWidth: 0
  },
  sideColumn: {
    minWidth: 0
  },
  plaidSection: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'relative' as const
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: '20px',
    fontSize: '20px',
    fontWeight: 600,
    color: '#2c3e50'
  },
  linkPrompt: {
    textAlign: 'center' as const,
    padding: '20px'
  },
  linkPromptText: {
    marginBottom: '20px',
    color: '#666',
    lineHeight: '1.5'
  },
  formContainer: {
    maxWidth: '700px',
    margin: '0 auto',
    backgroundColor: 'white',
    padding: '24px 20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  formHeader: {
    marginBottom: '28px',
    paddingBottom: '20px',
    borderBottom: '2px solid #f0f0f0'
  },
  formTitle: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    fontWeight: 700,
    color: '#2c3e50',
    letterSpacing: '-0.5px'
  },
  formSubtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.5'
  },
  backButton: {
    marginTop: '32px',
    padding: '12px 24px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    width: '100%'
  }
}

export default Dashboard
