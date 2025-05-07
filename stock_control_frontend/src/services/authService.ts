import api from '@/types/api'

export interface LoginPayload {
  username: string
  password: string
}

export interface TokenResponse {
  access: string
  refresh: string
}

class AuthService {
  /** Faz login e já armazena tokens no localStorage */
  async login(credentials: LoginPayload): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>('/token/', credentials)
    const { access, refresh } = data
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    return data
  }

  /** Tenta renovar o access token e retorna o novo */
  async refreshToken(): Promise<string> {
    const refresh = localStorage.getItem('refresh_token')
    if (!refresh) throw new Error('No refresh token')
    const { data } = await api.post<TokenResponse>('/token/refresh/', { refresh })
    localStorage.setItem('access_token', data.access)
    return data.access
  }

  /** Limpa tokens e redireciona ao login */
  logout(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    // opcional: window.location.href = '/login'
  }
}

export const authService = new AuthService()
