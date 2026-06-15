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
   * Login with 2FA code
   */
  loginWith2FA: async (email: string, password: string, code: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login/2fa', {
      email,
      password,
      code
    });
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

  /**
   * Get authentication configuration
   */
  getAuthConfig: async (): Promise<any> => {
    const response = await apiClient.get('/auth/config');
    return response.data;
  },

  // ==================== 2FA Methods ====================

  /**
   * Get 2FA configuration
   */
  get2FAConfig: async (): Promise<any> => {
    const response = await apiClient.get('/auth/2fa/config');
    return response.data;
  },

  /**
   * Setup 2FA
   */
  setup2FA: async (): Promise<any> => {
    const response = await apiClient.post('/auth/2fa/setup');
    return response.data;
  },

  /**
   * Verify and activate 2FA
   */
  verify2FA: async (code: string): Promise<any> => {
    const response = await apiClient.post('/auth/2fa/verify', { code });
    return response.data;
  },

  /**
   * Disable 2FA
   */
  disable2FA: async (code: string): Promise<any> => {
    const response = await apiClient.post('/auth/2fa/disable', { code });
    return response.data;
  },

  /**
   * Regenerate backup codes
   */
  regenerateBackupCodes: async (code: string): Promise<any> => {
    const response = await apiClient.post('/auth/2fa/backup-codes/regenerate', { code });
    return response.data;
  },

  // ==================== Passkey Methods ====================

  /**
   * Get Passkey configuration
   */
  getPasskeyConfig: async (): Promise<any> => {
    const response = await apiClient.get('/auth/passkey/config');
    return response.data;
  },

  /**
   * Get passkey registration options
   */
  getPasskeyRegistrationOptions: async (): Promise<any> => {
    const response = await apiClient.post('/auth/passkey/register/options');
    return response.data;
  },

  /**
   * Verify and register passkey
   */
  verifyPasskeyRegistration: async (credential: any): Promise<any> => {
    const response = await apiClient.post('/auth/passkey/register/verify', credential);
    return response.data;
  },

  /**
   * List passkeys
   */
  listPasskeys: async (): Promise<any> => {
    const response = await apiClient.get('/auth/passkey/list');
    return response.data;
  },

  /**
   * Remove passkey
   */
  removePasskey: async (credentialId: string): Promise<any> => {
    const response = await apiClient.delete(`/auth/passkey/${credentialId}`);
    return response.data;
  },

  /**
   * Disable passkey
   */
  disablePasskey: async (): Promise<any> => {
    const response = await apiClient.post('/auth/passkey/disable');
    return response.data;
  },

  /**
   * Get passkey authentication options for login
   */
  getPasskeyAuthenticationOptions: async (email: string): Promise<any> => {
    const response = await apiClient.post('/auth/passkey/authenticate/options', { email });
    return response.data;
  },

  /**
   * Verify passkey and complete login
   */
  verifyPasskeyAuthentication: async (email: string, assertion: any): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/passkey/authenticate/verify', {
      email,
      assertion
    });
    return response.data;
  },
};

// Made with Bob
