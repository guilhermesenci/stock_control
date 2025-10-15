// src/test/setup.ts - Configuração global para testes
import { vi, afterEach } from 'vitest'
import { config } from '@vue/test-utils'

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock do sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Mock do console para evitar logs durante os testes
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

// Mock do alert
global.alert = vi.fn()

// Mock do confirm
global.confirm = vi.fn()

// Configuração global do Vue Test Utils
config.global.mocks = {
  $t: (key: string) => key, // Mock para i18n se necessário
}

// Mock para axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    })),
    interceptors: {
      request: {
        use: vi.fn(),
        eject: vi.fn(),
      },
      response: {
        use: vi.fn(),
        eject: vi.fn(),
      },
    },
  },
}))

// Mock para router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  useRoute: () => ({
    path: '/',
    name: 'Home',
    params: {},
    query: {},
    hash: '',
    fullPath: '/',
    matched: [],
    meta: {},
  }),
}))

// Mock para Pinia
vi.mock('pinia', async (importOriginal) => {
  const actual = await importOriginal();
  const actualObj = (actual && typeof actual === 'object') ? actual : {};
  return {
    ...actualObj,
    createPinia: vi.fn(() => ({
      install: vi.fn(),
    })),
    setActivePinia: vi.fn(),
    defineStore: vi.fn(),
  }
})

// Cleanup após cada teste
afterEach(() => {
  vi.clearAllMocks()
  localStorageMock.clear()
  sessionStorageMock.clear()
})
