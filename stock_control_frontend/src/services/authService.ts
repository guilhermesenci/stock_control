import api from './api';

export const authService = {
  async login(username: string, password: string) {
    try {
      console.log('AuthService: Iniciando login');
      const response = await api.post('/token/', {
        username,
        password,
      });
      console.log('AuthService: Login bem sucedido');
      return response.data;
    } catch (error) {
      console.error('AuthService: Erro no login:', error);
      throw error;
    }
  },

  async refreshToken() {
    try {
      console.log('AuthService: Atualizando token');
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) {
        throw new Error('No refresh token available');
      }
      const response = await api.post('/token/refresh/', {
        refresh,
      });
      console.log('AuthService: Token atualizado');
      localStorage.setItem('access_token', response.data.access);
      return response.data.access;
    } catch (error) {
      console.error('AuthService: Erro ao atualizar token:', error);
      throw error;
    }
  },

  logout() {
    console.log('AuthService: Logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};
