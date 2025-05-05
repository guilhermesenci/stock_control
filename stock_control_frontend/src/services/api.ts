import axios, {
    AxiosError,
  } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { authService } from './authService';
  
  interface RetryableRequest extends AxiosRequestConfig {
    _retry?: boolean;
  }
  
  const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // ex: http://localhost:8000/api
  });
  
  // Request interceptor: adiciona Authorization header
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  
  // Response interceptor: trata 401 e tenta refresh
  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableRequest;
  
      // Se 401 e ainda não tentou refresh
      if (
        error.response?.status === 401 &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;
        try {
          // Tenta renovar o access token
          const newToken = await authService.refreshToken();
          // Atualiza header default e do request original
          axios.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          // Reenvia a requisição original
          return api(originalRequest);
        } catch (refreshError) {
          // Se refresh falhar, desloga e redireciona ao login
          authService.logout();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
  
      // Qualquer outro erro, propaga
      return Promise.reject(error);
    }
  );
  
  export default api;
  