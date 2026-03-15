import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transactionService } from '../../services/transactionService';
import apiClient from '../../services/apiClient';
import { Category } from '../../types/transaction';

vi.mock('../../services/apiClient', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockPost = vi.mocked(apiClient.post);
const mockGet = vi.mocked(apiClient.get);
const mockPut = vi.mocked(apiClient.put);
const mockDelete = vi.mocked(apiClient.delete);

const sampleTransaction = {
  id: 'tx-1',
  userId: 'u1',
  amount: 50,
  date: '2026-03-01',
  description: 'Groceries',
  category: Category.FOOD,
  createdAt: '2026-03-01T10:00:00',
  source: 'MANUAL' as const,
};

describe('transactionService', () => {
  beforeEach(() => vi.clearAllMocks());

  // FE-TXN-01
  it('createTransaction_PostsToCorrectEndpoint', async () => {
    mockPost.mockResolvedValueOnce({ data: sampleTransaction });
    const req = { amount: 50, date: '2026-03-01', description: 'Groceries', category: Category.FOOD };

    await transactionService.createTransaction(req);

    expect(mockPost).toHaveBeenCalledWith('/api/transactions', req);
  });

  // FE-TXN-02
  it('getAllTransactions_ReturnsTransactionArray', async () => {
    mockGet.mockResolvedValueOnce({ data: { transactions: [sampleTransaction], total: 50 } });

    const result = await transactionService.getAllTransactions();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('tx-1');
  });

  // FE-TXN-03
  it('updateTransaction_PutsToCorrectEndpoint', async () => {
    mockPut.mockResolvedValueOnce({ data: sampleTransaction });
    const req = { amount: 75, date: '2026-03-01', description: 'Updated', category: Category.FOOD };

    await transactionService.updateTransaction('tx-1', req);

    expect(mockPut).toHaveBeenCalledWith('/api/transactions/tx-1', req);
  });

  // FE-TXN-04
  it('deleteTransaction_DeletesCorrectEndpoint', async () => {
    mockDelete.mockResolvedValueOnce({ data: {} });

    await transactionService.deleteTransaction('tx-1');

    expect(mockDelete).toHaveBeenCalledWith('/api/transactions/tx-1');
  });

  // FE-TXN-05
  it('getTotalsByCategory_ReturnsMap', async () => {
    mockGet.mockResolvedValueOnce({
      data: { categoryTotals: [{ category: 'Food', total: 150 }] },
    });

    const result = await transactionService.getTotalsByCategory();

    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('Food');
    expect(result[0].total).toBe(150);
  });
});
