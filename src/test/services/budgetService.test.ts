import { describe, it, expect, vi, beforeEach } from 'vitest';
import { budgetService } from '../../services/budgetService';
import apiClient from '../../services/apiClient';

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

const sampleStatus = {
  budgetId: 'b-1',
  amount: 1000,
  spent: 300,
  remaining: 700,
  percentageUsed: 30,
  period: '2026-03',
};

describe('budgetService', () => {
  beforeEach(() => vi.clearAllMocks());

  // FE-BUD-01
  it('createBudget_PostsToCorrectEndpoint', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'b-1', amount: 1000, period: '2026-03' } });
    const req = { amount: 1000, period: '2026-03' };

    await budgetService.createBudget(req);

    expect(mockPost).toHaveBeenCalledWith('/api/budgets', req);
  });

  // FE-BUD-02
  it('getCurrentBudgetStatus_GetsBudgets', async () => {
    mockGet.mockResolvedValueOnce({ data: [sampleStatus] });

    const result = await budgetService.getCurrentBudgetStatus();

    expect(result).toHaveLength(1);
    expect(result[0].budgetId).toBe('b-1');
    expect(mockGet).toHaveBeenCalledWith('/api/budgets/current');
  });

  // FE-BUD-03
  it('updateBudget_PutsCorrectAmount', async () => {
    mockPut.mockResolvedValueOnce({ data: { id: 'b-1', amount: 1500 } });

    await budgetService.updateBudget('b-1', 1500);

    expect(mockPut).toHaveBeenCalledWith('/api/budgets/b-1', { amount: 1500 });
  });

  // FE-BUD-04
  it('deleteBudget_DeletesCorrectEndpoint', async () => {
    mockDelete.mockResolvedValueOnce({ data: {} });

    await budgetService.deleteBudget('b-1');

    expect(mockDelete).toHaveBeenCalledWith('/api/budgets/b-1');
  });
});
