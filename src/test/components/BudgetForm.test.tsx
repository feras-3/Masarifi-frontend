import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BudgetForm } from '../../components/BudgetForm'

// Stub ThemeContext
vi.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({ isDarkMode: false })
}))

const renderForm = (onSubmit = vi.fn()) =>
  render(<BudgetForm onSubmit={onSubmit} />)

describe('BudgetForm', () => {
  // FE-BF-01
  it('renders_AmountAndPeriodFields', () => {
    renderForm()
    expect(screen.getByLabelText(/budget amount/i)).toBeInTheDocument()
    expect(screen.getByText(/period/i)).toBeInTheDocument()
  })

  // FE-BF-02
  it('submit_WithEmptyAmount_ShowsError', async () => {
    renderForm()
    fireEvent.click(screen.getByRole('button', { name: /set budget/i }))
    await waitFor(() =>
      expect(screen.getByText(/amount is required/i)).toBeInTheDocument()
    )
  })

  // FE-BF-03
  it('submit_WithNegativeAmount_ShowsError', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText(/budget amount/i), '-5')
    fireEvent.click(screen.getByRole('button', { name: /set budget/i }))
    await waitFor(() =>
      expect(screen.getByText(/must be greater than zero/i)).toBeInTheDocument()
    )
  })

  // FE-BF-04
  it('submit_WithValidData_CallsOnSubmit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderForm(onSubmit)

    await userEvent.type(screen.getByLabelText(/budget amount/i), '500')
    fireEvent.click(screen.getByRole('button', { name: /set budget/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 500 })
    )
  })

  // FE-BF-05
  it('submit_WithCategory_IncludesCategory', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderForm(onSubmit)

    await userEvent.type(screen.getByLabelText(/budget amount/i), '300')
    await userEvent.selectOptions(screen.getByLabelText(/category/i), 'Food')
    fireEvent.click(screen.getByRole('button', { name: /set budget/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'Food' })
    )
  })

  // FE-BF-06
  it('submit_WithoutCategory_OmitsCategory', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderForm(onSubmit)

    await userEvent.type(screen.getByLabelText(/budget amount/i), '300')
    fireEvent.click(screen.getByRole('button', { name: /set budget/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    const submitted = onSubmit.mock.calls[0][0]
    expect(submitted.category === undefined || submitted.category === '').toBe(
      true
    )
  })

  // FE-BF-07
  it('submit_ShowsLoadingState', async () => {
    // onSubmit never resolves — button should be disabled
    const onSubmit = vi.fn(() => new Promise(() => {}))
    renderForm(onSubmit)

    await userEvent.type(screen.getByLabelText(/budget amount/i), '500')
    fireEvent.click(screen.getByRole('button', { name: /set budget/i }))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
    )
  })
})
