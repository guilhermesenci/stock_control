// stores/auth.ts
import { defineStore } from 'pinia';
import { authService } from '@/services/authService';
import { useRouter } from 'vue-router';

interface User {
  id: number;
  username: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('token'),
  }),
  getters: {
    isAuthenticated: (state): boolean => !!state.token,
  },
  actions: {
    async login(credentials: { username: string; password: string }): Promise<void> {
      try {
        const response = await authService.login(credentials.username, credentials.password);
        this.token = response.access;
        localStorage.setItem('token', response.access);
        localStorage.setItem('refreshToken', response.refresh);
        // TODO: Implementar endpoint para obter dados do usuário
        this.user = {
          id: 1, // Temporário até implementar endpoint
          username: credentials.username,
        };
      } catch (error) {
        this.logout();
        throw error;
      }
    },
    logout(): void {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      const router = useRouter();
      router.push('/login');
    },
  },
});
