// src/composables/useAuth.ts
import { ref } from 'vue'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/stores/auth'

/**
 * Estado reativo do token de acesso para uso em toda a aplicação.
 */
export const accessToken = ref<string>(localStorage.getItem('access_token') || '')

/**
 * Composable para lidar com autenticação.
 */
export function useAuth() {
  const authStore = useAuthStore()

  /**
   * Armazena os tokens no localStorage e no ref reativo.
   */
  function setTokens(access: string, refresh: string) {
    accessToken.value = access
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    authStore.token = access // Atualiza o estado do Pinia
  }

  /**
   * Faz login e popula os tokens.
   */
  async function login(username: string, password: string) {
    const response = await authService.login({ username, password })
    setTokens(response.access, response.refresh)
  }

  /**
   * Limpa tokens e redireciona para o login.
   */
  function logout() {
    accessToken.value = ''
    authStore.logout() // Usa o método do store que já faz tudo necessário
  }

  return { accessToken, login, logout }
}
