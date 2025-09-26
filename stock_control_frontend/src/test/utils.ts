// src/test/utils.ts - Utilitários para testes
import { mount, VueWrapper } from '@vue/test-utils'
import { vi } from 'vitest'
import type { App } from 'vue'

/**
 * Cria uma instância do Pinia para testes
 */
export function createTestPinia() {
  // Para testes, não precisamos de uma instância real do Pinia
  // já que estamos mockando os stores
  return {
    install: vi.fn(),
  }
}

/**
 * Wrapper para mount com configurações padrão para testes
 */
export function createWrapper(component: any, options: any = {}): VueWrapper<any> {
  const pinia = createTestPinia()
  
  return mount(component, {
    global: {
      plugins: [pinia],
      stubs: {
        'router-link': true,
        'router-view': true,
      },
    },
    ...options,
  })
}

/**
 * Mock de dados para testes
 */
export const mockData = {
  user: {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    isMaster: false,
    permissionsList: ['view_items', 'add_transactions'],
  },
  
  supplier: {
    codFornecedor: 1,
    nomeFornecedor: 'Fornecedor Teste',
    active: true,
  },
  
  item: {
    codSku: 'SKU001',
    descricaoItem: 'Produto Teste',
    active: true,
  },
  
  transaction: {
    id: 'entrada-1',
    sku: 'SKU001',
    description: 'Produto Teste',
    quantity: 10,
    unitCost: 25.50,
    totalCost: 255.00,
    transactionType: 'entrada',
    notaFiscal: '12345',
  },
  
  stockCost: {
    sku: 'SKU001',
    unitCost: 25.50,
    lastEntryCost: 25.50,
    averageCost: 25.50,
  },
}

/**
 * Mock de respostas da API
 */
export const mockApiResponses = {
  login: {
    access: 'mock-access-token',
    refresh: 'mock-refresh-token',
  },
  
  user: mockData.user,
  
  suppliers: {
    results: [mockData.supplier],
    count: 1,
    next: null,
    previous: null,
  },
  
  items: {
    results: [mockData.item],
    count: 1,
    next: null,
    previous: null,
  },
  
  transactions: {
    results: [mockData.transaction],
    count: 1,
    next: null,
    previous: null,
  },
  
  stockCosts: {
    results: [mockData.stockCost],
    count: 1,
    next: null,
    previous: null,
  },
}

/**
 * Cria um mock de função com retorno específico
 */
export function createMockFunction(returnValue: any = {}) {
  return vi.fn().mockResolvedValue(returnValue)
}

/**
 * Cria um mock de função que rejeita com erro
 */
export function createMockErrorFunction(error: any = new Error('Mock error')) {
  return vi.fn().mockRejectedValue(error)
}

/**
 * Simula delay para testes assíncronos
 */
export function delay(ms: number = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Mock de localStorage para testes
 */
export function mockLocalStorage() {
  const store: Record<string, string> = {}
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
  }
}
