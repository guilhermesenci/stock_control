// api.ts
import axios, {
    AxiosError,
} from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { authService } from '@/services/authService';
import { toCamelCase } from '@/utils/case';

interface RetryableRequest extends AxiosRequestConfig {
    _retry?: boolean;
}

const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    headers: {
       'ngrok-skip-browser-warning': 'true',
    },
});

api.interceptors.response.use(
    (response) => {
      response.data = toCamelCase(response.data);
      return response;
    },
    // … seu tratamento de erros
  );

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

/**
 * Formato genérico para resposta paginada da API.
 */
export interface Paginated<T> {
    /** itens retornados na página atual */
    results: T[];
    /** total de itens disponíveis */
    count: number;
    /** URL (ou token) da próxima página, ou null se não houver */
    next: string | null;
    /** URL (ou token) da página anterior, ou null se não houver */
    previous: string | null;
  }
  
  /**
   * Converte um payload paginado no formato DRF
   * ({ results, count, next, previous }) em Paginated<U>.
   *
   * @param data resposta bruta da API (data.results, data.count, ...)
   * @param mapper fn que mapeia cada item bruto para sua forma tipada U
   */
  export function mapPaginated<T, U = T>(
    data: { results: any[]; count: number; next: string | null; previous: string | null },
    mapper: (item: any) => U
  ): Paginated<U> {
    return {
      results: data.results.map(mapper),
      count: data.count,
      next: data.next,
      previous: data.previous,
    };
  }
  