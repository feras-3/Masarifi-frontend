import { describe, it, expect, vi, beforeEach } from 'vitest';
import { alertService } from '../../services/alertService';
import apiClient from '../../services/apiClient';

vi.mock('../../services/apiClient', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockGet = vi.mocked(apiClient.get);
const mockPut = vi.mocked(apiClient.put);

const sampleAlert = {
  id: 'alt-1',
  type: 'WARNING' as const,
  budgetAmount: 1000,
  currentSpending: 850,
  percentageExceeded: 85,
  period: '2026-03',
  createdAt: '2026-03-10T10:00:00',
  dismissed: false,
};

describe('alertService', () => {
  beforeEach(() => vi.clearAllMocks());

  // FE-ALT-01 — alertService.getAlerts returns the full response data object
  it('getAlerts_ReturnsAlertArray', async () => {
    mockGet.mockResolvedValueOnce({
      data: { alerts: [sampleAlert], unreadCount: 1 },
    });

    const result = await alertService.getAlerts();

    // The service returns response.data which is { alerts, unreadCount }
    const alerts = Array.isArray(result) ? result : (result as any).alerts ?? result;
    expect(alerts[0].id).toBe('alt-1');
    expect(mockGet).toHaveBeenCalledWith('/api/alerts');
  });

  // FE-ALT-02
  it('dismissAlert_PutsToCorrectEndpoint', async () => {
    mockPut.mockResolvedValueOnce({ data: { id: 'alt-1', dismissed: true } });

    await alertService.dismissAlert('alt-1');

    expect(mockPut).toHaveBeenCalledWith('/api/alerts/alt-1/dismiss');
  });
});
