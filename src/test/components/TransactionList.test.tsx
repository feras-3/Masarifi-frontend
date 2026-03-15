import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransactionList } from '../../components/TransactionList'
import * as transactionServiceModule from '../../services/transactionService'
import { Category } from '../../types/transaction'

vi.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({ isDarkMode: false })
}))

vi.mock('../../components/ConfirmDialog', () => ({
  ConfirmDialog: ({ isOpen, onConfirm }: any) =>
    isOpen ? (
      <button data-testid="confirm-btn" onClick={onConfirm}>
        Confirm
      </button>
    ) : null
}))

const makeTx = (overrides = {}) => ({
  id: 'tx-1',
  userId: 'u1',
  amount: 50,
  date: '2026-03-01',
  description: 'Groceries',
  category: Category.FOOD,
  createdAt: '2026-03-01T10:00:00',
  source: 'MANUAL' as const,
  ...overrides
})

// Helper: wait until at least one element with text appears
const waitForText = (text: string) =>
  waitFor(() => expect(screen.getAllByText(text).length).toBeGreaterThan(0))

describe('TransactionList', () => {
  const onEdit = vi.fn()
  const onDelete = vi.fn()

  beforeEach(() => vi.clearAllMocks())

  // FE-TL-01
  it('renders_LoadingState', () => {
    vi.spyOn(
      transactionServiceModule.transactionService,
      'getAllTransactions'
    ).mockReturnValue(new Promise(() => {}))

    render(<TransactionList onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText(/loading transactions/i)).toBeInTheDocument()
  })

  // FE-TL-02
  it('renders_EmptyState', async () => {
    vi.spyOn(
      transactionServiceModule.transactionService,
      'getAllTransactions'
    ).mockResolvedValue([])

    render(<TransactionList onEdit={onEdit} onDelete={onDelete} />)
    await waitFor(() =>
      expect(screen.getByText(/no transactions available/i)).toBeInTheDocument()
    )
  })

  // FE-TL-03
  it('renders_TransactionRows', async () => {
    vi.spyOn(
      transactionServiceModule.transactionService,
      'getAllTransactions'
    ).mockResolvedValue([
      makeTx({ id: 'tx-1' }),
      makeTx({ id: 'tx-2', description: 'Lunch' })
    ])

    render(<TransactionList onEdit={onEdit} onDelete={onDelete} />)
    await waitForText('Groceries')
    expect(screen.getAllByText('Lunch').length).toBeGreaterThan(0)
  })

  // FE-TL-04
  it('filter_ByCategory_FiltersCorrectly', async () => {
    vi.spyOn(
      transactionServiceModule.transactionService,
      'getAllTransactions'
    ).mockResolvedValue([
      makeTx({ id: 'tx-1', category: Category.FOOD, description: 'Groceries' }),
      makeTx({
        id: 'tx-2',
        category: Category.TRANSPORTATION,
        description: 'Bus fare'
      })
    ])

    render(<TransactionList onEdit={onEdit} onDelete={onDelete} />)
    await waitForText('Groceries')

    await userEvent.selectOptions(screen.getByLabelText(/category/i), 'Food')

    expect(screen.getAllByText('Groceries').length).toBeGreaterThan(0)
    expect(screen.queryByText('Bus fare')).not.toBeInTheDocument()
  })

  // FE-TL-05
  it('filter_BySource_FiltersCorrectly', async () => {
    vi.spyOn(
      transactionServiceModule.transactionService,
      'getAllTransactions'
    ).mockResolvedValue([
      makeTx({ id: 'tx-1', source: 'MANUAL', description: 'Manual entry' }),
      makeTx({ id: 'tx-2', source: 'PLAID', description: 'Bank import' })
    ])

    render(<TransactionList onEdit={onEdit} onDelete={onDelete} />)
    await waitForText('Manual entry')

    await userEvent.selectOptions(screen.getByLabelText(/source/i), 'PLAID')

    expect(screen.getAllByText('Bank import').length).toBeGreaterThan(0)
    expect(screen.queryByText('Manual entry')).not.toBeInTheDocument()
  })

  // FE-TL-06
  it('editButton_NotShownForPlaidTransactions', async () => {
    vi.spyOn(
      transactionServiceModule.transactionService,
      'getAllTransactions'
    ).mockResolvedValue([makeTx({ source: 'PLAID' })])

    render(<TransactionList onEdit={onEdit} onDelete={onDelete} />)
    await waitForText('Groceries')

    expect(
      screen.queryByRole('button', { name: /edit/i })
    ).not.toBeInTheDocument()
  })

  // FE-TL-07
  it('deleteButton_TriggersConfirmDialog', async () => {
    vi.spyOn(
      transactionServiceModule.transactionService,
      'getAllTransactions'
    ).mockResolvedValue([makeTx()])

    render(<TransactionList onEdit={onEdit} onDelete={onDelete} />)
    await waitForText('Groceries')

    await userEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(screen.getByTestId('confirm-btn')).toBeInTheDocument()
  })

  // FE-TL-08
  it('total_CalculatesCorrectly', async () => {
    vi.spyOn(
      transactionServiceModule.transactionService,
      'getAllTransactions'
    ).mockResolvedValue([
      makeTx({ id: 'tx-1', amount: 50 }),
      makeTx({ id: 'tx-2', amount: 30 })
    ])

    render(<TransactionList onEdit={onEdit} onDelete={onDelete} />)
    await waitForText('Groceries')

    expect(screen.getByText('$80.00')).toBeInTheDocument()
  })
})
