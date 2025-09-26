// src/stores/__tests__/auth.spec.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'
import { mockData, mockApiResponses, mockLocalStorage } from '@/test/utils'

// Mock dos serviços
vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn(),
  },
}))

vi.mock('@/services/userService', () => ({
  default: {
    getCurrentUser: vi.fn(),
  },
}))

describe('useAuthStore', () => {
  let mockLocalStorageInstance: any

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorageInstance = mockLocalStorage()
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorageInstance,
    })
    
    // Reset mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('estado inicial', () => {
    it('inicializa com valores padrão', () => {
      const store = useAuthStore()
      
      expect(store.user).toBe(null)
      expect(store.token).toBe(null)
      expect(store.currentUser).toBe(null)
      expect(store.loading).toBe(false)
      expect(store.error).toBe(null)
    })

    it('carrega token do localStorage', () => {
      mockLocalStorageInstance.getItem.mockReturnValue('stored-token')
      
      const store = useAuthStore()
      
      expect(store.token).toBe('stored-token')
    })
  })

  describe('getters', () => {
    it('isAuthenticated retorna true quando há token', () => {
      const store = useAuthStore()
      store.token = 'some-token'
      
      expect(store.isAuthenticated).toBe(true)
    })

    it('isAuthenticated retorna false quando não há token', () => {
      const store = useAuthStore()
      store.token = null
      
      expect(store.isAuthenticated).toBe(false)
    })

    it('hasPermission retorna true para usuário master', () => {
      const store = useAuthStore()
      store.currentUser = { ...mockData.user, isMaster: true }
      
      expect(store.hasPermission('any_permission')).toBe(true)
    })

    it('hasPermission retorna true para permissão específica', () => {
      const store = useAuthStore()
      store.currentUser = mockData.user
      
      expect(store.hasPermission('view_items')).toBe(true)
      expect(store.hasPermission('add_transactions')).toBe(true)
    })

    it('hasPermission retorna false para permissão não concedida', () => {
      const store = useAuthStore()
      store.currentUser = mockData.user
      
      expect(store.hasPermission('admin_permission')).toBe(false)
    })

    it('hasPermission retorna false quando não há usuário', () => {
      const store = useAuthStore()
      store.currentUser = null
      
      expect(store.hasPermission('any_permission')).toBe(false)
    })

    it('isMaster retorna true para usuário master', () => {
      const store = useAuthStore()
      store.currentUser = { ...mockData.user, isMaster: true }
      
      expect(store.isMaster).toBe(true)
    })

    it('isMaster retorna false para usuário não master', () => {
      const store = useAuthStore()
      store.currentUser = mockData.user
      
      expect(store.isMaster).toBe(false)
    })

    it('isMaster retorna false quando não há usuário', () => {
      const store = useAuthStore()
      store.currentUser = null
      
      expect(store.isMaster).toBe(false)
    })
  })

  describe('actions', () => {
    describe('login', () => {
      it('faz login com sucesso', async () => {
        const { authService } = require('@/services/authService')
        const { default: userService } = require('@/services/userService')
        
        authService.login.mockResolvedValue(mockApiResponses.login)
        userService.getCurrentUser.mockResolvedValue(mockData.user)
        
        const store = useAuthStore()
        
        await store.login({ username: 'testuser', password: 'password' })
        
        expect(store.token).toBe('mock-access-token')
        expect(store.currentUser).toEqual(mockData.user)
        expect(store.user).toEqual({ id: 1, username: 'testuser' })
        expect(store.loading).toBe(false)
        expect(store.error).toBe(null)
        expect(mockLocalStorageInstance.setItem).toHaveBeenCalledWith('access_token', 'mock-access-token')
        expect(mockLocalStorageInstance.setItem).toHaveBeenCalledWith('refresh_token', 'mock-refresh-token')
      })

      it('trata erro no login', async () => {
        const { authService } = require('@/services/authService')
        const mockError = new Error('Invalid credentials')
        authService.login.mockRejectedValue(mockError)
        
        const store = useAuthStore()
        
        await expect(store.login({ username: 'testuser', password: 'wrong' })).rejects.toThrow('Invalid credentials')
        
        expect(store.error).toBe('Invalid credentials')
        expect(store.loading).toBe(false)
        expect(store.token).toBe(null)
        expect(store.user).toBe(null)
        expect(store.currentUser).toBe(null)
      })

      it('define loading como true durante login', async () => {
        const { authService } = require('@/services/authService')
        const { default: userService } = require('@/services/userService')
        
        authService.login.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
        userService.getCurrentUser.mockResolvedValue(mockData.user)
        
        const store = useAuthStore()
        
        const loginPromise = store.login({ username: 'testuser', password: 'password' })
        
        expect(store.loading).toBe(true)
        
        await loginPromise
        
        expect(store.loading).toBe(false)
      })
    })

    describe('fetchCurrentUser', () => {
      it('carrega dados do usuário atual', async () => {
        const { default: userService } = require('@/services/userService')
        userService.getCurrentUser.mockResolvedValue(mockData.user)
        
        const store = useAuthStore()
        
        await store.fetchCurrentUser()
        
        expect(store.currentUser).toEqual(mockData.user)
        expect(store.user).toEqual({ id: 1, username: 'testuser' })
        expect(store.loading).toBe(false)
        expect(store.error).toBe(null)
      })

      it('trata erro ao carregar usuário', async () => {
        const { default: userService } = require('@/services/userService')
        const mockError = new Error('User not found')
        userService.getCurrentUser.mockRejectedValue(mockError)
        
        const store = useAuthStore()
        
        await expect(store.fetchCurrentUser()).rejects.toThrow('User not found')
        
        expect(store.error).toBe('User not found')
        expect(store.loading).toBe(false)
        expect(store.user).toBe(null)
        expect(store.currentUser).toBe(null)
      })
    })

    describe('logout', () => {
      it('limpa todos os dados do usuário', () => {
        const store = useAuthStore()
        
        // Preenche dados
        store.user = mockData.user
        store.currentUser = mockData.user
        store.token = 'some-token'
        store.error = 'some error'
        
        store.logout()
        
        expect(store.user).toBe(null)
        expect(store.currentUser).toBe(null)
        expect(store.token).toBe(null)
        expect(store.error).toBe(null)
        expect(mockLocalStorageInstance.removeItem).toHaveBeenCalledWith('access_token')
        expect(mockLocalStorageInstance.removeItem).toHaveBeenCalledWith('refresh_token')
      })
    })

    describe('clearError', () => {
      it('limpa erro', () => {
        const store = useAuthStore()
        store.error = 'some error'
        
        store.clearError()
        
        expect(store.error).toBe(null)
      })
    })

    describe('refreshUser', () => {
      it('atualiza dados do usuário quando autenticado', async () => {
        const { default: userService } = require('@/services/userService')
        userService.getCurrentUser.mockResolvedValue(mockData.user)
        
        const store = useAuthStore()
        store.token = 'some-token'
        
        await store.refreshUser()
        
        expect(store.currentUser).toEqual(mockData.user)
      })

      it('não atualiza quando não autenticado', async () => {
        const { default: userService } = require('@/services/userService')
        
        const store = useAuthStore()
        store.token = null
        
        await store.refreshUser()
        
        expect(userService.getCurrentUser).not.toHaveBeenCalled()
      })
    })
  })

  describe('integração', () => {
    it('fluxo completo de autenticação', async () => {
      const { authService } = require('@/services/authService')
      const { default: userService } = require('@/services/userService')
      
      authService.login.mockResolvedValue(mockApiResponses.login)
      userService.getCurrentUser.mockResolvedValue(mockData.user)
      
      const store = useAuthStore()
      
      // Login
      await store.login({ username: 'testuser', password: 'password' })
      
      expect(store.isAuthenticated).toBe(true)
      expect(store.hasPermission('view_items')).toBe(true)
      expect(store.isMaster).toBe(false)
      
      // Refresh user
      const updatedUser = { ...mockData.user, username: 'updateduser' }
      userService.getCurrentUser.mockResolvedValue(updatedUser)
      
      await store.refreshUser()
      
      expect(store.currentUser?.username).toBe('updateduser')
      
      // Logout
      store.logout()
      
      expect(store.isAuthenticated).toBe(false)
      expect(store.hasPermission('view_items')).toBe(false)
      expect(store.user).toBe(null)
      expect(store.currentUser).toBe(null)
    })
  })
})
