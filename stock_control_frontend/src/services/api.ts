// api.ts - Configuração unificada da API
import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { authService } from '@/services/authService';
import { toCamelCase } from '@/utils/case';

interface RetryableRequest extends AxiosRequestConfig {
    _retry?: boolean;
}

/**
 * Instância configurada do Axios para todas as requisições da aplicação
 */
const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000, // 10 segundos de timeout
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    },
});

// Interceptor de request: adiciona token de autorização
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de response: converte dados e trata erros
api.interceptors.response.use(
    (response: AxiosResponse) => {
        // Converte snake_case para camelCase
        if (response.data) {
            response.data = toCamelCase(response.data);
        }
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryableRequest;

        // Trata erro 401 (não autorizado)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Tenta renovar o token
                const newToken = await authService.refreshToken();
                
                // Atualiza headers
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }
                
                // Reenvia a requisição original
                return api(originalRequest);
            } catch (refreshError) {
                // Se refresh falhar, desloga e redireciona
                authService.logout();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api; 