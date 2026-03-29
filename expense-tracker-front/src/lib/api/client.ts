import axios, { type AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const retriedRequests = new WeakSet();

apiClient.interceptors.response.use(
  (response) => {
    if (response.data?.success) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest.url?.includes('/auth/');

    if (error.response?.status !== 401 || retriedRequests.has(originalRequest) || isAuthEndpoint) {
      return Promise.reject(error);
    }

    retriedRequests.add(originalRequest);

    try {
      const refreshToken = useAuthStore.getState().getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');

      const { data: envelope } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        { refreshToken },
      );

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        envelope.data as { accessToken: string; refreshToken: string };

      localStorage.setItem('refresh_token', newRefreshToken);
      useAuthStore.getState().setAccessToken(newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  },
);

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then((res) => res.data),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config).then((res) => res.data),
  delete: (url: string, config?: AxiosRequestConfig) =>
    apiClient.delete(url, config),
};

export default apiClient;
