import api from './axios';

export const authService = {
  async login(username: string, password: string) {
    try {
      console.log('AuthService: Iniciando login');
      const response = await api.post('/api/token/', {
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

  async refreshToken(refresh: string) {
    try {
      console.log('AuthService: Atualizando token');
      const response = await api.post('/api/token/refresh/', {
        refresh,
      });
      console.log('AuthService: Token atualizado');
      return response.data;
    } catch (error) {
      console.error('AuthService: Erro ao atualizar token:', error);
      throw error;
    }
  },

  logout() {
    console.log('AuthService: Logout');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },
};
