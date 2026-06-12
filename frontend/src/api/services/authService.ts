import apiClient from '../client';
import { LoginRequest, AuthResponse } from '@/types';

export const authService = {
  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', null, {
      params: { refreshToken },
    });
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  /**
   * Check authentication status
   */
  checkAuth: async (): Promise<boolean> => {
    try {
      await apiClient.get('/auth/health');
      return true;
    } catch {
      return false;
    }
  },
};

// Made with Bob
