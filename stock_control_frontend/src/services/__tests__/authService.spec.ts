// src/services/__tests__/authService.spec.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { authService } from '../authService'
import api from '../api'
import { mockLocalStorage } from '@/test/utils'

// Mock do api
vi.mock('../api', () => ({
  default: {
    post: vi.fn(),
  },
}))

describe('authService', () => {
  let mockApi: any
  let mockLocalStorageInstance: any

  beforeEach(() => {
    mockApi = api as any
    vi.clearAllMocks()
    
    // Mock localStorage
    mockLocalStorageInstance = mockLocalStorage()
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorageInstance,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('faz login com credenciais válidas', async () => {
      const mockResponse = {
        data: {
          access: 'access-token',
          refresh: 'refresh-token',
        },
      }
      mockApi.post.mockResolvedValue(mockResponse)

      const result = await authService.login('username', 'password')

      expect(mockApi.post).toHaveBeenCalledWith('/api/token/', {
        username: 'username',
        password: 'password',
      })
      expect(result).toEqual({
        access: 'access-token',
        refresh: 'refresh-token',
      })
    })

    it('trata erro no login', async () => {
      const mockError = new Error('Invalid credentials')
      mockApi.post.mockRejectedValue(mockError)

      await expect(authService.login('username', 'wrongpassword')).rejects.toThrow('Invalid credentials')
    })

    it('faz login com diferentes tipos de credenciais', async () => {
      const mockResponse = {
        data: {
          access: 'access-token',
          refresh: 'refresh-token',
        },
      }
      mockApi.post.mockResolvedValue(mockResponse)

      await authService.login('admin@example.com', 'admin123')

      expect(mockApi.post).toHaveBeenCalledWith('/api/token/', {
        username: 'admin@example.com',
        password: 'admin123',
      })
    })
  })

  describe('refreshToken', () => {
    it('atualiza token com refresh token válido', async () => {
      mockLocalStorageInstance.getItem.mockReturnValue('refresh-token')
      const mockResponse = {
        data: {
          access: 'new-access-token',
        },
      }
      mockApi.post.mockResolvedValue(mockResponse)

      const result = await authService.refreshToken()

      expect(mockLocalStorageInstance.getItem).toHaveBeenCalledWith('refresh_token')
      expect(mockApi.post).toHaveBeenCalledWith('/api/token/refresh/', {
        refresh: 'refresh-token',
      })
      expect(mockLocalStorageInstance.setItem).toHaveBeenCalledWith('access_token', 'new-access-token')
      expect(result).toBe('new-access-token')
    })

    it('falha quando não há refresh token', async () => {
      mockLocalStorageInstance.getItem.mockReturnValue(null)

      await expect(authService.refreshToken()).rejects.toThrow('No refresh token available')
      expect(mockApi.post).not.toHaveBeenCalled()
    })

    it('falha quando refresh token é inválido', async () => {
      mockLocalStorageInstance.getItem.mockReturnValue('invalid-refresh-token')
      const mockError = new Error('Token is invalid or expired')
      mockApi.post.mockRejectedValue(mockError)

      await expect(authService.refreshToken()).rejects.toThrow('Token is invalid or expired')
    })

    it('atualiza localStorage com novo access token', async () => {
      mockLocalStorageInstance.getItem.mockReturnValue('refresh-token')
      const mockResponse = {
        data: {
          access: 'new-access-token',
        },
      }
      mockApi.post.mockResolvedValue(mockResponse)

      await authService.refreshToken()

      expect(mockLocalStorageInstance.setItem).toHaveBeenCalledWith('access_token', 'new-access-token')
    })
  })

  describe('logout', () => {
    it('remove tokens do localStorage', () => {
      authService.logout()

      expect(mockLocalStorageInstance.removeItem).toHaveBeenCalledWith('access_token')
      expect(mockLocalStorageInstance.removeItem).toHaveBeenCalledWith('refresh_token')
    })

    it('remove tokens mesmo se não existirem', () => {
      mockLocalStorageInstance.removeItem.mockImplementation(() => {
        // Simula que o item não existe
      })

      authService.logout()

      expect(mockLocalStorageInstance.removeItem).toHaveBeenCalledWith('access_token')
      expect(mockLocalStorageInstance.removeItem).toHaveBeenCalledWith('refresh_token')
    })
  })

  describe('integração', () => {
    it('fluxo completo de login e refresh', async () => {
      // Login
      const loginResponse = {
        data: {
          access: 'access-token',
          refresh: 'refresh-token',
        },
      }
      mockApi.post.mockResolvedValueOnce(loginResponse)

      const loginResult = await authService.login('username', 'password')
      expect(loginResult.access).toBe('access-token')

      // Refresh
      mockLocalStorageInstance.getItem.mockReturnValue('refresh-token')
      const refreshResponse = {
        data: {
          access: 'new-access-token',
        },
      }
      mockApi.post.mockResolvedValueOnce(refreshResponse)

      const refreshResult = await authService.refreshToken()
      expect(refreshResult).toBe('new-access-token')

      // Logout
      authService.logout()
      expect(mockLocalStorageInstance.removeItem).toHaveBeenCalledWith('access_token')
      expect(mockLocalStorageInstance.removeItem).toHaveBeenCalledWith('refresh_token')
    })
  })
})
