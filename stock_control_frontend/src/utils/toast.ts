// src/utils/toast.ts
import { useNotificationStore } from '@/stores/notifications';

/**
 * @deprecated Use useNotificationStore diretamente ou useErrorHandler
 * Mantido para compatibilidade com código existente
 */
export function toastError(message: string): void {
    const notificationStore = useNotificationStore();
    notificationStore.error('Erro', message);
}

/**
 * @deprecated Use useNotificationStore diretamente
 */
export function toastSuccess(message: string): void {
    const notificationStore = useNotificationStore();
    notificationStore.success('Sucesso', message);
}

/**
 * @deprecated Use useNotificationStore diretamente
 */
export function toastWarning(message: string): void {
    const notificationStore = useNotificationStore();
    notificationStore.warning('Atenção', message);
}

/**
 * @deprecated Use useNotificationStore diretamente
 */
export function toastInfo(message: string): void {
    const notificationStore = useNotificationStore();
    notificationStore.info('Informação', message);
}
