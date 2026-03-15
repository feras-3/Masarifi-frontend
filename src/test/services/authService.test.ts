import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../../services/authService';
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

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // FE-AUTH-01
  it('login_CallsCorrectEndpoint', async () => {
    mockPost.mockResolvedValueOnce({ data: { token: 'tok', username: 'alice' } });

    await authService.login({ username: 'alice', password: 'pass' });

    expect(mockPost).toHaveBeenCalledWith('/api/auth/login', {
      username: 'alice',
      password: 'pass',
    });
  });

  // FE-AUTH-02
  it('login_ReturnsTokenAndUsername', async () => {
    mockPost.mockResolvedValueOnce({ data: { token: 'jwt-abc', username: 'alice' } });

    const result = await authService.login({ username: 'alice', password: 'pass' });

    expect(result.token).toBe('jwt-abc');
    expect(result.username).toBe('alice');
  });

  // FE-AUTH-03
  it('register_CallsCorrectEndpoint', async () => {
    mockPost.mockResolvedValueOnce({ data: { token: 'tok', username: 'newuser' } });

    await authService.register({ username: 'newuser', password: 'pass' });

    expect(mockPost).toHaveBeenCalledWith('/api/auth/register', {
      username: 'newuser',
      password: 'pass',
    });
  });

  // FE-AUTH-04
  it('register_ReturnsAuthResponse', async () => {
    mockPost.mockResolvedValueOnce({ data: { token: 'tok-new', username: 'newuser' } });

    const result = await authService.register({ username: 'newuser', password: 'pass' });

    expect(result.token).toBe('tok-new');
    expect(result.username).toBe('newuser');
  });
});
