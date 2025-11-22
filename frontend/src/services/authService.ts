import apiClient from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt?: string;
  isPremium?: boolean;
  isAdmin?: boolean;
  stripeCustomerId?: string;
  subscriptionStatus?: string;
  subscriptionEndDate?: string;
  hasUsedTrial?: boolean;
  cancelAtPeriodEnd?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  async getProfile(): Promise<{ user: User }> {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
