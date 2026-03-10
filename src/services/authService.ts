import apiClient from './apiClient';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';

export const authService = {
  // Register a new user
  // POST /api/auth/register
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  // Login with username and password
  // POST /api/auth/login
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
    return response.data;
  }
};

export default authService;
