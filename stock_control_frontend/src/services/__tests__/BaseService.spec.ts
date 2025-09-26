// src/services/__tests__/BaseService.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BaseService } from '../BaseService'
import api from '../api'
import { mockApiResponses } from '@/test/utils'

// Mock do api
vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

// Classe de teste que estende BaseService
class TestService extends BaseService<any, any, any, any> {
  constructor() {
    super('/api/test')
  }
}

describe('BaseService', () => {
  let service: TestService
  let mockApi: any

  beforeEach(() => {
    service = new TestService()
    mockApi = api as any
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('busca todos os itens sem filtros', async () => {
      const mockResponse = { data: mockApiResponses.items }
      mockApi.get.mockResolvedValue(mockResponse)

      const result = await service.getAll()

      expect(mockApi.get).toHaveBeenCalledWith('/api/test/?')
      expect(result).toEqual(mockApiResponses.items)
    })

    it('busca todos os itens com paginação', async () => {
      const mockResponse = { data: mockApiResponses.items }
      mockApi.get.mockResolvedValue(mockResponse)

      const result = await service.getAll(2)

      expect(mockApi.get).toHaveBeenCalledWith('/api/test/?')
      expect(result).toEqual(mockApiResponses.items)
    })

    it('busca todos os itens com filtros', async () => {
      const mockResponse = { data: mockApiResponses.items }
      mockApi.get.mockResolvedValue(mockResponse)
      const filters = { status: 'active', name: 'test' }

      const result = await service.getAll(1, filters)

      expect(mockApi.get).toHaveBeenCalledWith('/api/test/?status=active&name=test')
      expect(result).toEqual(mockApiResponses.items)
    })

    it('ignora filtros vazios', async () => {
      const mockResponse = { data: mockApiResponses.items }
      mockApi.get.mockResolvedValue(mockResponse)
      const filters = { status: 'active', name: '', description: null, count: undefined }

      const result = await service.getAll(1, filters)

      expect(mockApi.get).toHaveBeenCalledWith('/api/test/?status=active')
      expect(result).toEqual(mockApiResponses.items)
    })

    it('trata erro na busca', async () => {
      const mockError = new Error('API Error')
      mockApi.get.mockRejectedValue(mockError)

      await expect(service.getAll()).rejects.toThrow('API Error')
    })
  })

  describe('getById', () => {
    it('busca item por ID', async () => {
      const mockItem = { id: 1, name: 'Test Item' }
      const mockResponse = { data: mockItem }
      mockApi.get.mockResolvedValue(mockResponse)

      const result = await service.getById(1)

      expect(mockApi.get).toHaveBeenCalledWith('/api/test/1/')
      expect(result).toEqual(mockItem)
    })

    it('busca item por ID string', async () => {
      const mockItem = { id: 'abc', name: 'Test Item' }
      const mockResponse = { data: mockItem }
      mockApi.get.mockResolvedValue(mockResponse)

      const result = await service.getById('abc')

      expect(mockApi.get).toHaveBeenCalledWith('/api/test/abc/')
      expect(result).toEqual(mockItem)
    })

    it('trata erro na busca por ID', async () => {
      const mockError = new Error('Not Found')
      mockApi.get.mockRejectedValue(mockError)

      await expect(service.getById(999)).rejects.toThrow('Not Found')
    })
  })

  describe('create', () => {
    it('cria novo item', async () => {
      const newItem = { name: 'New Item', status: 'active' }
      const mockResponse = { data: { id: 1, ...newItem } }
      mockApi.post.mockResolvedValue(mockResponse)

      const result = await service.create(newItem)

      expect(mockApi.post).toHaveBeenCalledWith('/api/test/', newItem)
      expect(result).toEqual({ id: 1, ...newItem })
    })

    it('trata erro na criação', async () => {
      const newItem = { name: 'New Item' }
      const mockError = new Error('Validation Error')
      mockApi.post.mockRejectedValue(mockError)

      await expect(service.create(newItem)).rejects.toThrow('Validation Error')
    })
  })

  describe('update', () => {
    it('atualiza item existente', async () => {
      const updateData = { name: 'Updated Item' }
      const mockResponse = { data: { id: 1, ...updateData } }
      mockApi.put.mockResolvedValue(mockResponse)

      const result = await service.update(1, updateData)

      expect(mockApi.put).toHaveBeenCalledWith('/api/test/1/', updateData)
      expect(result).toEqual({ id: 1, ...updateData })
    })

    it('atualiza item com ID string', async () => {
      const updateData = { name: 'Updated Item' }
      const mockResponse = { data: { id: 'abc', ...updateData } }
      mockApi.put.mockResolvedValue(mockResponse)

      const result = await service.update('abc', updateData)

      expect(mockApi.put).toHaveBeenCalledWith('/api/test/abc/', updateData)
      expect(result).toEqual({ id: 'abc', ...updateData })
    })

    it('trata erro na atualização', async () => {
      const updateData = { name: 'Updated Item' }
      const mockError = new Error('Update Error')
      mockApi.put.mockRejectedValue(mockError)

      await expect(service.update(1, updateData)).rejects.toThrow('Update Error')
    })
  })

  describe('patch', () => {
    it('atualiza parcialmente item', async () => {
      const patchData = { name: 'Patched Item' }
      const mockResponse = { data: { id: 1, ...patchData } }
      mockApi.patch.mockResolvedValue(mockResponse)

      const result = await service.patch(1, patchData)

      expect(mockApi.patch).toHaveBeenCalledWith('/api/test/1/', patchData)
      expect(result).toEqual({ id: 1, ...patchData })
    })

    it('trata erro na atualização parcial', async () => {
      const patchData = { name: 'Patched Item' }
      const mockError = new Error('Patch Error')
      mockApi.patch.mockRejectedValue(mockError)

      await expect(service.patch(1, patchData)).rejects.toThrow('Patch Error')
    })
  })

  describe('delete', () => {
    it('remove item', async () => {
      mockApi.delete.mockResolvedValue({})

      await service.delete(1)

      expect(mockApi.delete).toHaveBeenCalledWith('/api/test/1/')
    })

    it('remove item com ID string', async () => {
      mockApi.delete.mockResolvedValue({})

      await service.delete('abc')

      expect(mockApi.delete).toHaveBeenCalledWith('/api/test/abc/')
    })

    it('trata erro na remoção', async () => {
      const mockError = new Error('Delete Error')
      mockApi.delete.mockRejectedValue(mockError)

      await expect(service.delete(1)).rejects.toThrow('Delete Error')
    })
  })

  describe('search', () => {
    it('busca itens com termo', async () => {
      const mockResponse = { data: { results: [mockApiResponses.items.results[0]] } }
      mockApi.get.mockResolvedValue(mockResponse)

      const result = await service.search('test')

      expect(mockApi.get).toHaveBeenCalledWith('/api/test/?search=test')
      expect(result).toEqual([mockApiResponses.items.results[0]])
    })

    it('busca itens com termo codificado', async () => {
      const mockResponse = { data: { results: [] } }
      mockApi.get.mockResolvedValue(mockResponse)

      await service.search('test with spaces & symbols')

      expect(mockApi.get).toHaveBeenCalledWith('/api/test/?search=test%20with%20spaces%20%26%20symbols')
    })

    it('retorna array vazio quando não há results', async () => {
      const mockResponse = { data: [] }
      mockApi.get.mockResolvedValue(mockResponse)

      const result = await service.search('test')

      expect(result).toEqual([])
    })

    it('trata erro na busca', async () => {
      const mockError = new Error('Search Error')
      mockApi.get.mockRejectedValue(mockError)

      await expect(service.search('test')).rejects.toThrow('Search Error')
    })
  })
})
