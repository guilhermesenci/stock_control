// src/composables/useAuth.ts
import { ref } from 'vue'
import { authService } from '@/services/authService'

/**
 * Estado reativo do token de acesso para uso em toda a aplicação.
 */
export const accessToken = ref<string>(localStorage.getItem('access_token') || '')

/**
 * Composable para lidar com autenticação.
 */
export function useAuth() {
  /**
   * Armazena os tokens no localStorage e no ref reativo.
   */
  function setTokens(access: string, refresh: string) {
    accessToken.value = access
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
  }

  /**
   * Faz login e popula os tokens.
   */
  async function login(username: string, password: string) {
    await authService.login({ username, password })
    const access = localStorage.getItem('access_token')!
    const refresh = localStorage.getItem('refresh_token')!
    setTokens(access, refresh)
  }

  /**
   * Limpa tokens e redireciona para o login.
   */
  function logout() {
    accessToken.value = ''
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    // opcional: redirecionar
    window.location.href = '/login'
  }

  return { accessToken, login, logout }
}
