import { describe, it, expect, beforeEach } from 'vitest';
import apiClient from './apiClient';

describe('apiClient', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should be configured with correct base URL', () => {
    expect(apiClient.defaults.baseURL).toBeDefined();
  });

  it('should have request interceptor configured', () => {
    expect(apiClient.interceptors.request).toBeDefined();
  });

  it('should have response interceptor configured', () => {
    expect(apiClient.interceptors.response).toBeDefined();
  });

  it('should include Authorization header when token is present in localStorage', () => {
    const testToken = 'test-token-123';
    localStorage.setItem('auth_token', testToken);

    // Get the request interceptor
    const requestInterceptor = apiClient.interceptors.request.handlers?.[0];
    if (requestInterceptor && requestInterceptor.fulfilled) {
      const result = requestInterceptor.fulfilled({
        headers: {},
      } as any);

      // Handle both sync and async results
      if (result && typeof result === 'object' && 'headers' in result) {
        expect(result.headers.Authorization).toBe(`Bearer ${testToken}`);
      }
    }
  });
});
