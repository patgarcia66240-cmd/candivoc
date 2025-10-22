import { apiClient } from './client';

// Interfaces locales pour éviter les problèmes d'export
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'candidate' | 'recruiter' | 'admin';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'candidate' | 'recruiter';
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<APIResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

    if (response.success && response.data) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  },

  async register(data: RegisterData): Promise<APIResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);

    if (response.success && response.data) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  async getCurrentUser(): Promise<APIResponse<User>> {
    return apiClient.get<User>('/auth/me');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }
};