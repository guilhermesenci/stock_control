// stores/auth.ts - Store refatorado para autenticação
import { defineStore } from 'pinia';
import { authService } from '@/services/authService';
import userService, { type User } from '@/services/userService';

interface AuthState {
  user: User | null;
  token: string | null;
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('access_token'),
    currentUser: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token,
    hasPermission: (state) => (permission: string): boolean => {
      if (!state.currentUser) return false;
      if (state.currentUser.isMaster) return true;
      return state.currentUser.permissionsList.includes(permission);
    },
    isMaster: (state): boolean => state.currentUser?.isMaster ?? false,
  },

  actions: {
    /**
     * Realiza login do usuário
     */
    async login(credentials: { username: string; password: string }): Promise<void> {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await authService.login(credentials.username, credentials.password);
        
        // Armazena tokens
        this.token = response.access;
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        
        // Carrega informações completas do usuário
        await this.fetchCurrentUser();
      } catch (error: any) {
        this.error = error.message || 'Erro ao fazer login';
        this.logout();
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Carrega informações do usuário atual
     */
    async fetchCurrentUser(): Promise<void> {
      this.loading = true;
      this.error = null;
      
      try {
        const userData = await userService.getCurrentUser();
        this.currentUser = userData;
        
        // Mantém compatibilidade com user básico
        this.user = {
          id: userData.id,
          username: userData.username
        } as User;
      } catch (error: any) {
        this.error = error.message || 'Erro ao carregar dados do usuário';
        console.error('Erro ao buscar dados do usuário atual:', error);
        this.logout();
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Realiza logout do usuário
     */
    logout(): void {
      this.user = null;
      this.currentUser = null;
      this.token = null;
      this.error = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    },

    /**
     * Limpa erros
     */
    clearError(): void {
      this.error = null;
    },

    /**
     * Atualiza informações do usuário atual
     */
    async refreshUser(): Promise<void> {
      if (this.isAuthenticated) {
        await this.fetchCurrentUser();
      }
    },
  },
});
