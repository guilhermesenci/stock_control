import api from './api'; // sua instância axios já configurada

// shape do payload de login
export interface LoginPayload {
  username: string;
  password: string;
}

// shape da resposta do servidor
export interface TokenResponse {
  access: string;
  refresh: string;
}

class AuthService {
  async login(credentials: LoginPayload): Promise<void> {
    const res = await api.post<TokenResponse>('/token/', credentials);
    const { access, refresh } = res.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }

  async refreshToken(): Promise<string> {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) throw new Error('No refresh token');
    const res = await api.post<TokenResponse>('/token/refresh/', { refresh });
    localStorage.setItem('access_token', res.data.access);
    return res.data.access;
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}

export const authService = new AuthService();
