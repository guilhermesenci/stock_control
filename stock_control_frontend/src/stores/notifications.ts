// stores/notifications.ts - Store centralizado para notificações
import { defineStore } from 'pinia';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number; // em ms, 0 = não remove automaticamente
  actions?: NotificationAction[];
  persistent?: boolean; // se true, não remove automaticamente
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

interface NotificationState {
  notifications: Notification[];
}

export const useNotificationStore = defineStore('notifications', {
  state: (): NotificationState => ({
    notifications: [],
  }),

  actions: {
    /**
     * Adiciona uma nova notificação
     */
    add(notification: Omit<Notification, 'id'>): string {
      const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newNotification: Notification = {
        id,
        duration: 5000, // 5 segundos por padrão
        persistent: false,
        ...notification,
      };

      this.notifications.push(newNotification);

      // Remove automaticamente se não for persistente
      if (!newNotification.persistent && newNotification.duration && newNotification.duration > 0) {
        setTimeout(() => {
          this.remove(id);
        }, newNotification.duration);
      }

      return id;
    },

    /**
     * Remove uma notificação por ID
     */
    remove(id: string): void {
      const index = this.notifications.findIndex(n => n.id === id);
      if (index > -1) {
        this.notifications.splice(index, 1);
      }
    },

    /**
     * Remove todas as notificações
     */
    clear(): void {
      this.notifications = [];
    },

    /**
     * Remove todas as notificações de um tipo específico
     */
    clearByType(type: Notification['type']): void {
      this.notifications = this.notifications.filter(n => n.type !== type);
    },

    // Métodos de conveniência para diferentes tipos de notificação
    success(title: string, message: string, options?: Partial<Notification>): string {
      return this.add({
        type: 'success',
        title,
        message,
        ...options,
      });
    },

    error(title: string, message: string, options?: Partial<Notification>): string {
      return this.add({
        type: 'error',
        title,
        message,
        duration: 8000, // Erros ficam mais tempo
        ...options,
      });
    },

    warning(title: string, message: string, options?: Partial<Notification>): string {
      return this.add({
        type: 'warning',
        title,
        message,
        ...options,
      });
    },

    info(title: string, message: string, options?: Partial<Notification>): string {
      return this.add({
        type: 'info',
        title,
        message,
        ...options,
      });
    },

    /**
     * Notificação de erro de API com tratamento automático
     */
    apiError(error: any, fallbackTitle = 'Erro'): string {
      let title = fallbackTitle;
      let message = 'Ocorreu um erro inesperado.';

      // Extrai mensagem de erro baseada no tipo de resposta
      const errorData = error?.response?.data;
      
      if (errorData) {
        // Trata erros de validação do Django REST Framework
        if (this.isValidationError(errorData)) {
          message = this.parseValidationErrors(errorData);
          title = 'Dados inválidos';
        }
        // Trata erro com campo 'detail'
        else if (errorData.detail) {
          message = errorData.detail;
        }
        // Trata erro com campo 'message'
        else if (errorData.message) {
          message = errorData.message;
        }
        // Trata erro com campo 'error'
        else if (errorData.error) {
          message = errorData.error;
        }
      }
      // Fallback para statusText ou message do erro
      else if (error?.response?.statusText) {
        message = error.response.statusText;
      } else if (error?.message) {
        message = error.message;
      }

      // Títulos específicos baseados no status HTTP
      if (error?.response?.status) {
        switch (error.response.status) {
          case 400:
            title = 'Dados inválidos';
            break;
          case 401:
            title = 'Não autorizado';
            break;
          case 403:
            title = 'Acesso negado';
            break;
          case 404:
            title = 'Não encontrado';
            break;
          case 422:
            title = 'Dados inválidos';
            break;
          case 500:
            title = 'Erro do servidor';
            break;
          default:
            title = 'Erro na requisição';
        }
      }

      return this.error(title, message);
    },

    /**
     * Verifica se o erro é um erro de validação do Django REST Framework
     */
    isValidationError(errorData: any): boolean {
      // Django REST Framework retorna erros de validação como objeto com campos
      // Exemplo: { "codSku": ["Item com este Código SKU já existe."] }
      if (typeof errorData === 'object' && errorData !== null) {
        // Verifica se tem campos de validação (não é 'detail', 'message', 'error')
        const keys = Object.keys(errorData);
        return keys.length > 0 && 
               !keys.includes('detail') && 
               !keys.includes('message') && 
               !keys.includes('error') &&
               // Verifica se pelo menos um valor é um array (formato típico do DRF)
               Object.values(errorData).some(value => Array.isArray(value));
      }
      return false;
    },

    /**
     * Parseia erros de validação do Django REST Framework em mensagem legível
     */
    parseValidationErrors(errorData: any): string {
      const errors: string[] = [];
      
      Object.entries(errorData).forEach(([field, messages]) => {
        if (Array.isArray(messages)) {
          // Adiciona cada mensagem do campo
          messages.forEach((msg: string) => {
            errors.push(msg);
          });
        } else if (typeof messages === 'string') {
          errors.push(messages);
        }
      });

      // Retorna as mensagens separadas por quebra de linha
      return errors.join('\n');
    },
  },
});
