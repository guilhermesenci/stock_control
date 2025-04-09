import { defineStore } from 'pinia';
import axios from 'axios';

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
      // const response = await axios.post('https://sua-api.com/login', credentials);
      // retornar sucesso, ainda não implementado
      const response = {
        data: {
            "user": {
                "id": 1,
                "username": credentials.username,
            },
            "token": "fake-jwt-token"
        }
      };

      this.user = response.data.user;
      this.token = response.data.token;
      localStorage.setItem('token', this.token);
    },
    logout(): void {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
    },
  },
});
