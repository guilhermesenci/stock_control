// stores/auth.ts
import { defineStore } from 'pinia';
import { authService } from '@/services/authService';
import userService, { type User } from '@/services/userService';
import { useRouter } from 'vue-router';

interface AuthState {
  user: User | null;
  token: string | null;
  currentUser: User | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('access_token'),
    currentUser: null,
  }),
  getters: {
    isAuthenticated: (state): boolean => !!state.token,
  },
  actions: {
    async login(credentials: { username: string; password: string }): Promise<void> {
      try {
        const response = await authService.login(credentials.username, credentials.password);
        this.token = response.access;
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        
        // Carrega informações completas do usuário após login
        await this.fetchCurrentUser();
      } catch (error) {
        this.logout();
        throw error;
      }
    },
    
    async fetchCurrentUser(): Promise<void> {
      try {
        // Carrega informações completas do usuário atual
        const userData = await userService.getCurrentUser();
        this.currentUser = userData;
        
        // Também atualiza o user básico para compatibilidade
        this.user = {
          id: userData.id,
          username: userData.username
        } as User;
      } catch (error) {
        console.error('Erro ao buscar dados do usuário atual:', error);
        // Se não conseguir carregar dados do usuário, desloga
        this.logout();
        throw error;
      }
    },
    
    logout(): void {
      this.user = null;
      this.currentUser = null;
      this.token = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      const router = useRouter();
      router.push('/login');
    },
  },
});
