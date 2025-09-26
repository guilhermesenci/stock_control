// src/composables/__tests__/useAuth.spec.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useAuth, accessToken } from '../useAuth'
import { mockLocalStorage } from '@/test/utils'

// Mock do authService
vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn(),
  },
}))

// Mock do store
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    token: null,
    logout: vi.fn(),
  })),
}))

describe('useAuth', () => {
  let mockLocalStorageInstance: any
  let mockAuthStore: any

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Mock localStorage
    mockLocalStorageInstance = mockLocalStorage()
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorageInstance,
    })
    
    // Mock store
    mockAuthStore = {
      token: null,
      logout: vi.fn(),
    }
    
    // Mock do store já está configurado no setup
    // useAuthStore.mockReturnValue(mockAuthStore)
    
    // Reset accessToken
    accessToken.value = ''
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('inicializa com token do localStorage', () => {
    mockLocalStorageInstance.getItem.mockReturnValue('stored-token')
    
    const { accessToken: token } = useAuth()
    
    expect(token.value).toBe('stored-token')
  })

  it('inicializa sem token quando localStorage está vazio', () => {
    mockLocalStorageInstance.getItem.mockReturnValue(null)
    
    const { accessToken: token } = useAuth()
    
    expect(token.value).toBe('')
  })

  it('armazena tokens corretamente', () => {
    const { setTokens } = useAuth()
    
    setTokens('new-access-token', 'new-refresh-token')
    
    expect(accessToken.value).toBe('new-access-token')
    expect(mockLocalStorageInstance.setItem).toHaveBeenCalledWith('access_token', 'new-access-token')
    expect(mockLocalStorageInstance.setItem).toHaveBeenCalledWith('refresh_token', 'new-refresh-token')
    expect(mockAuthStore.token).toBe('new-access-token')
  })

  it('faz login e armazena tokens', async () => {
    const mockResponse = {
      access: 'access-token',
      refresh: 'refresh-token',
    }
    
    const { authService } = require('@/services/authService')
    authService.login.mockResolvedValue(mockResponse)
    
    const { login } = useAuth()
    
    await login('username', 'password')
    
    expect(authService.login).toHaveBeenCalledWith({ username: 'username', password: 'password' })
    expect(accessToken.value).toBe('access-token')
    expect(mockLocalStorageInstance.setItem).toHaveBeenCalledWith('access_token', 'access-token')
    expect(mockLocalStorageInstance.setItem).toHaveBeenCalledWith('refresh_token', 'refresh-token')
    expect(mockAuthStore.token).toBe('access-token')
  })

  it('trata erro no login', async () => {
    const mockError = new Error('Login failed')
    
    const { authService } = require('@/services/authService')
    authService.login.mockRejectedValue(mockError)
    
    const { login } = useAuth()
    
    await expect(login('username', 'password')).rejects.toThrow('Login failed')
    
    // Tokens não devem ser armazenados em caso de erro
    expect(accessToken.value).toBe('')
    expect(mockLocalStorageInstance.setItem).not.toHaveBeenCalled()
  })

  it('faz logout corretamente', () => {
    // Primeiro armazena um token
    accessToken.value = 'some-token'
    mockAuthStore.token = 'some-token'
    
    const { logout } = useAuth()
    
    logout()
    
    expect(accessToken.value).toBe('')
    expect(mockAuthStore.logout).toHaveBeenCalled()
  })

  it('limpa tokens do localStorage no logout', () => {
    const { logout } = useAuth()
    
    logout()
    
    expect(mockLocalStorageInstance.removeItem).toHaveBeenCalledWith('access_token')
    expect(mockLocalStorageInstance.removeItem).toHaveBeenCalledWith('refresh_token')
  })

  it('retorna as funções corretas', () => {
    const auth = useAuth()
    
    expect(auth).toHaveProperty('accessToken')
    expect(auth).toHaveProperty('login')
    expect(auth).toHaveProperty('logout')
    expect(auth).toHaveProperty('setTokens')
    
    expect(typeof auth.login).toBe('function')
    expect(typeof auth.logout).toBe('function')
    expect(typeof auth.setTokens).toBe('function')
  })

  it('mantém reatividade do accessToken', () => {
    const { accessToken: token, setTokens } = useAuth()
    
    expect(token.value).toBe('')
    
    setTokens('new-token', 'refresh-token')
    
    expect(token.value).toBe('new-token')
  })

  it('funciona com parâmetros de login corretos', async () => {
    const mockResponse = {
      access: 'access-token',
      refresh: 'refresh-token',
    }
    
    const { authService } = require('@/services/authService')
    authService.login.mockResolvedValue(mockResponse)
    
    const { login } = useAuth()
    
    await login('testuser', 'testpass')
    
    expect(authService.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'testpass',
    })
  })

  it('atualiza store corretamente', () => {
    const { setTokens } = useAuth()
    
    setTokens('token1', 'refresh1')
    expect(mockAuthStore.token).toBe('token1')
    
    setTokens('token2', 'refresh2')
    expect(mockAuthStore.token).toBe('token2')
  })
})
