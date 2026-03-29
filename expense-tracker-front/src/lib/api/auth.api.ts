import { api } from './client';
import { ENDPOINTS } from './endpoints';
import type { User } from '@/types';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const authApi = {
  register: (data: { name: string; username: string; password: string }) =>
    api.post<AuthResponse>(ENDPOINTS.auth.register, data),

  login: (data: { username: string; password: string }) =>
    api.post<AuthResponse>(ENDPOINTS.auth.login, data),

  logout: (refreshToken: string) =>
    api.post(ENDPOINTS.auth.logout, { refreshToken }),

  checkUsername: (username: string) =>
    api.get<{ available: boolean }>(ENDPOINTS.auth.checkUsername(username)),

  me: () => api.get<User>(ENDPOINTS.auth.me),
};
