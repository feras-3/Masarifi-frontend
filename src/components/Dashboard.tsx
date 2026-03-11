import React, { useState, useEffect } from 'react';
import { BudgetSummary } from './BudgetSummary';
import { AlertBanner } from './AlertBanner';
import { TransactionList } from './TransactionList';
import PlaidAccountStatus from './PlaidAccountStatus';
import PlaidLinkButton from './PlaidLinkButton';
import SyncTransactionsButton from './SyncTransactionsButton';
import { TransactionForm } from './TransactionForm';
import { BudgetForm } from './BudgetForm';
import { TransactionEditModal } from './TransactionEditModal';
import { Transaction, TransactionRequest } from '../types/transaction';
import { BudgetRequest } from '../types/budget';
import { transactionService } from '../services/transactionService';
import { budgetService } from '../services/budgetService';
import plaidService from '../services/plaidService';
import { useAuth } from '../contexts/AuthContext';

type View = 'dashboard' | 'add-transaction' | 'manage-budget';

export const Dashboard: React.FC = () => {
  const { logout, username } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [hasLinkedAccount, setHasLinkedAccount] = useState(false);
  const [checkingAccount, setCheckingAccount] = useState(true);

  useEffect(() => {
    checkLinkedAccount();
  }, []);

  const checkLinkedAccount = async () => {
    try {
      const response = await plaidService.getLinkedAccounts();
      setHasLinkedAccount(response.linked);
    } catch (err) {
      console.error('Error checking linked accounts:', err);
      setHasLinkedAccount(false);
    } finally {
      setCheckingAccount(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTransactionSubmit = async (request: TransactionRequest) => {
    await transactionService.createTransaction(request);
    handleRefresh();
    setCurrentView('dashboard');
  };

  const handleBudgetSubmit = async (request: BudgetRequest) => {
    await budgetService.createBudget(request);
    handleRefresh();
    setCurrentView('dashboard');
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDelete = async (id: string) => {
    try {
      await transactionService.deleteTransaction(id);
      handleRefresh();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      throw err;
    }
  };

  const handleEditSave = async (id: string, data: TransactionRequest) => {
    await transactionService.updateTransaction(id, data);
    setEditingTransaction(null);
    handleRefresh();
  };

  const handleEditClose = () => {
    setEditingTransaction(null);
  };

  const handlePlaidLinkSuccess = () => {
    setHasLinkedAccount(true);
    handleRefresh();
  };

  const handleUnlink = () => {
    setHasLinkedAccount(false);
    handleRefresh();
  };

  const handleSyncComplete = (newCount: number) => {
    if (newCount > 0) {
      handleRefresh();
    }
  };

  const renderNavigation = () => (
    <nav style={styles.nav}>
      <div style={styles.navBrand}>
        💰 Expense Tracker
      </div>
      <div style={styles.navButtons}>
        <button
          onClick={() => setCurrentView('dashboard')}
          style={{
            ...styles.navButton,
            ...(currentView === 'dashboard' ? styles.navButtonActive : {})
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
        >
          Add Transaction
        </button>
        <button
          onClick={() => setCurrentView('manage-budget')}
          style={{
            ...styles.navButton,
            ...(currentView === 'manage-budget' ? styles.navButtonActive : {})
          }}
        >
          Manage Budget
        </button>
      </div>
      <div style={styles.navRight}>
        {username && (
          <span style={styles.navUsername}>👤 {username}</span>
        )}
        <button onClick={logout} style={styles.logoutButton}>
          Logout
        </button>
      </div>
    </nav>
  );

  const renderDashboardView = () => (
    <div style={styles.dashboardGrid}>
      {/* Left Column - Main Content */}
      <div style={styles.mainColumn}>
        <AlertBanner refreshTrigger={refreshTrigger} />
        
        <BudgetSummary refreshTrigger={refreshTrigger} />
        
        <TransactionList
          onEdit={handleEdit}
          onDelete={handleDelete}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* Right Column - Plaid Integration */}
      <div style={styles.sideColumn}>
        <div style={styles.plaidSection}>
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
  );

  const renderAddTransactionView = () => (
    <div style={styles.formContainer}>
      <h2>Add New Transaction</h2>
      <TransactionForm onSubmit={handleTransactionSubmit} />
      <button
        onClick={() => setCurrentView('dashboard')}
        style={styles.backButton}
      >
        ← Back to Dashboard
      </button>
    </div>
  );

  const renderManageBudgetView = () => (
    <div style={styles.formContainer}>
      <h2>Manage Budget</h2>
      <BudgetForm onSubmit={handleBudgetSubmit} />
      <button
        onClick={() => setCurrentView('dashboard')}
        style={styles.backButton}
      >
        ← Back to Dashboard
      </button>
    </div>
  );

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
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  nav: {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  navBrand: {
    fontSize: '24px',
    fontWeight: 'bold'
  },
  navButtons: {
    display: 'flex',
    gap: '10px'
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  navUsername: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '14px'
  },
  logoutButton: {
    padding: '7px 16px',
    backgroundColor: 'transparent',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.5)',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.2s'
  },
  navButton: {
    backgroundColor: 'transparent',
    color: 'white',
    border: '2px solid transparent',
    borderRadius: '4px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  navButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'white'
  },
  main: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '30px 20px'
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '30px'
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
    position: 'sticky' as const,
    top: '20px'
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
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  backButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600
  }
};

export default Dashboard;
