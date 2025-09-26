// src/composables/useApiError.ts
import { AxiosError } from 'axios';
import { useNotificationStore } from '@/stores/notifications';

/**
 * Handler centralizado para erros de API.
 * Exibe uma notificação de erro usando o sistema de notificações.
 */
export function handleApiError(err: unknown): void {
  const notificationStore = useNotificationStore();
  notificationStore.apiError(err);
}

/**
 * Composable para tratamento de erros com mais controle
 */
export function useErrorHandler() {
  const notificationStore = useNotificationStore();

  const handleError = (error: unknown, customTitle?: string) => {
    notificationStore.apiError(error, customTitle);
  };

  const handleValidationError = (error: unknown, customTitle = 'Dados inválidos') => {
    notificationStore.apiError(error, customTitle);
  };

  const handleSuccess = (title: string, message: string) => {
    notificationStore.success(title, message);
  };

  const handleWarning = (title: string, message: string) => {
    notificationStore.warning(title, message);
  };

  const handleInfo = (title: string, message: string) => {
    notificationStore.info(title, message);
  };

  return {
    handleError,
    handleValidationError,
    handleSuccess,
    handleWarning,
    handleInfo,
  };
}
