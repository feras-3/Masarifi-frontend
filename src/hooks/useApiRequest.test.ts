import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useApiRequest } from './useApiRequest';

describe('useApiRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('executes API function successfully', async () => {
    const mockApiFunction = vi.fn().mockResolvedValue({ data: 'test' });
    const { result } = renderHook(() => useApiRequest(mockApiFunction));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    await result.current.execute();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual({ data: 'test' });
      expect(result.current.error).toBeNull();
    });
  });

  it('handles network errors', async () => {
    const networkError = {
      code: 'ERR_NETWORK',
      message: 'Network Error'
    };
    const mockApiFunction = vi.fn().mockRejectedValue(networkError);
    const { result } = renderHook(() => 
      useApiRequest(mockApiFunction, { retryCount: 0 })
    );

    await result.current.execute();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toEqual({
        error: 'Network Error',
        message: 'Unable to connect to the server. Please check your internet connection and try again.'
      });
    });
  });

  it('handles server errors with response', async () => {
    const serverError = {
      response: {
        data: {
          error: 'Validation failed',
          message: 'Invalid input',
          fields: {
            amount: 'Must be greater than zero'
          }
        }
      }
    };
    const mockApiFunction = vi.fn().mockRejectedValue(serverError);
    const { result } = renderHook(() => useApiRequest(mockApiFunction));

    await result.current.execute();

    await waitFor(() => {
      expect(result.current.error).toEqual({
        error: 'Validation failed',
        message: 'Invalid input',
        fields: {
          amount: 'Must be greater than zero'
        }
      });
    });
  });

  it('retries on network error', async () => {
    const networkError = {
      code: 'ERR_NETWORK',
      message: 'Network Error'
    };
    const mockApiFunction = vi.fn()
      .mockRejectedValueOnce(networkError)
      .mockRejectedValueOnce(networkError)
      .mockResolvedValue({ data: 'success' });

    const { result } = renderHook(() => 
      useApiRequest(mockApiFunction, { retryCount: 2, retryDelay: 10 })
    );

    await result.current.execute();

    await waitFor(() => {
      expect(result.current.data).toEqual({ data: 'success' });
      expect(mockApiFunction).toHaveBeenCalledTimes(3);
    });
  });

  it('does not retry on non-network errors', async () => {
    const serverError = {
      response: {
        data: {
          error: 'Server Error',
          message: 'Internal server error'
        }
      }
    };
    const mockApiFunction = vi.fn().mockRejectedValue(serverError);
    const { result } = renderHook(() => 
      useApiRequest(mockApiFunction, { retryCount: 2 })
    );

    await result.current.execute();

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(mockApiFunction).toHaveBeenCalledTimes(1);
    });
  });

  it('resets state', async () => {
    const mockApiFunction = vi.fn().mockResolvedValue({ data: 'test' });
    const { result } = renderHook(() => useApiRequest(mockApiFunction));

    await result.current.execute();

    await waitFor(() => {
      expect(result.current.data).toEqual({ data: 'test' });
    });

    await waitFor(() => {
      result.current.reset();
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  it('handles request timeout', async () => {
    const timeoutError = {
      request: {},
      message: 'timeout of 5000ms exceeded'
    };
    const mockApiFunction = vi.fn().mockRejectedValue(timeoutError);
    const { result } = renderHook(() => useApiRequest(mockApiFunction));

    await result.current.execute();

    await waitFor(() => {
      expect(result.current.error).toEqual({
        error: 'Connection Error',
        message: 'The server did not respond. Please try again later.'
      });
    });
  });
});
