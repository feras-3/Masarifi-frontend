import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { ApiError } from '../components/ErrorMessage';

interface UseApiRequestOptions {
  retryCount?: number;
  retryDelay?: number;
}

interface UseApiRequestResult<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useApiRequest<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiRequestOptions = {}
): UseApiRequestResult<T> {
  const { retryCount = 2, retryDelay = 1000 } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const parseError = (err: any): ApiError => {
    if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
      return {
        error: 'Network Error',
        message: 'Unable to connect to the server. Please check your internet connection and try again.'
      };
    }

    if (err.response) {
      // Server responded with error
      const responseData = err.response.data;
      return {
        error: responseData.error || 'Server Error',
        message: responseData.message || 'An error occurred on the server',
        fields: responseData.fields
      };
    }

    if (err.request) {
      // Request made but no response
      return {
        error: 'Connection Error',
        message: 'The server did not respond. Please try again later.'
      };
    }

    // Something else happened
    return {
      error: 'Error',
      message: err.message || 'An unexpected error occurred'
    };
  };

  const executeWithRetry = async (
    fn: () => Promise<T>,
    retriesLeft: number
  ): Promise<T> => {
    try {
      return await fn();
    } catch (err) {
      if (retriesLeft > 0 && (err as AxiosError).code === 'ERR_NETWORK') {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return executeWithRetry(fn, retriesLeft - 1);
      }
      throw err;
    }
  };

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await executeWithRetry(
          () => apiFunction(...args),
          retryCount
        );
        setData(result);
        return result;
      } catch (err) {
        const parsedError = parseError(err);
        setError(parsedError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, retryCount, retryDelay]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}
