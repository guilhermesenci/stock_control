// src/composables/useApiError.ts
import { AxiosError } from 'axios';
import { toastError } from '@/utils/toast';

/**
 * Handler centralizado para erros de API.
 * Exibe uma notificação de erro usando alert() ou seu componente de toast.
 */
export function handleApiError(err: unknown): void {
  if (err instanceof AxiosError) {
    const message =
      // campo `detail` é comum no DRF, mas pode variar conforme sua API
      (err.response?.data as any)?.detail ||
      err.response?.statusText ||
      err.message;
    toastError(message);
  } else {
    toastError(String(err));
  }
}
