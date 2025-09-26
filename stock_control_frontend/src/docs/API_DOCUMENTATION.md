# Documentação da API - Stock Control Frontend

Este documento descreve os serviços de API, endpoints e padrões de comunicação do frontend com o backend Django.

## 🔗 Visão Geral da API

O frontend se comunica com o backend Django através de APIs REST, utilizando Axios como cliente HTTP. Todas as requisições são tipadas com TypeScript para maior segurança e produtividade.

### Base URL
- **Desenvolvimento**: `http://localhost:8000/api/`
- **Produção**: Configurável via variável de ambiente `VITE_API_BASE_URL`

## 🏗️ Estrutura dos Serviços

### Cliente HTTP Base (`services/api.ts`)

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors para autenticação e tratamento de erros
api.interceptors.request.use(/* ... */);
api.interceptors.response.use(/* ... */);

export default api;
```

### Padrão de Serviços

Todos os serviços seguem o mesmo padrão:

```typescript
class EntityService {
  // Listar todos os itens
  async getAll(params?: QueryParams): Promise<PaginatedResponse<Entity>> {
    const response = await api.get('/entities/', { params });
    return response.data;
  }

  // Buscar por ID
  async getById(id: number): Promise<Entity> {
    const response = await api.get(`/entities/${id}/`);
    return response.data;
  }

  // Criar novo item
  async create(data: CreateEntityRequest): Promise<Entity> {
    const response = await api.post('/entities/', data);
    return response.data;
  }

  // Atualizar item
  async update(id: number, data: UpdateEntityRequest): Promise<Entity> {
    const response = await api.put(`/entities/${id}/`, data);
    return response.data;
  }

  // Deletar item
  async delete(id: number): Promise<void> {
    await api.delete(`/entities/${id}/`);
  }
}
```

## 🔐 Serviço de Autenticação

### Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/login/` | Login do usuário |
| POST | `/auth/logout/` | Logout do usuário |
| POST | `/auth/refresh/` | Renovar token |
| GET | `/auth/user/` | Dados do usuário atual |

### Implementação

```typescript
// services/authService.ts
class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  }

  async logout(): Promise<void> {
    await api.post('/auth/logout/');
  }

  async refreshToken(): Promise<TokenResponse> {
    const response = await api.post('/auth/refresh/');
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/user/');
    return response.data;
  }
}
```

### Tipos TypeScript

```typescript
// types/auth.ts
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  date_joined: string;
}
```

## 📦 Serviço de Itens

### Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/items/` | Listar itens (com paginação e filtros) |
| GET | `/items/{id}/` | Buscar item por ID |
| POST | `/items/` | Criar novo item |
| PUT | `/items/{id}/` | Atualizar item |
| DELETE | `/items/{id}/` | Deletar item |
| GET | `/items/search/` | Buscar itens |

### Implementação

```typescript
// services/itemService.ts
class ItemService {
  async getItems(params?: ItemQueryParams): Promise<PaginatedResponse<Item>> {
    const response = await api.get('/items/', { params });
    return response.data;
  }

  async getItemById(id: number): Promise<Item> {
    const response = await api.get(`/items/${id}/`);
    return response.data;
  }

  async createItem(data: CreateItemRequest): Promise<Item> {
    const response = await api.post('/items/', data);
    return response.data;
  }

  async updateItem(id: number, data: UpdateItemRequest): Promise<Item> {
    const response = await api.put(`/items/${id}/`, data);
    return response.data;
  }

  async deleteItem(id: number): Promise<void> {
    await api.delete(`/items/${id}/`);
  }

  async searchItems(query: string): Promise<Item[]> {
    const response = await api.get('/items/search/', { 
      params: { q: query } 
    });
    return response.data;
  }
}
```

### Tipos TypeScript

```typescript
// types/item.ts
export interface Item {
  id: number;
  cod_sku: string;
  descricao_item: string;
  preco_custo: number;
  preco_venda: number;
  estoque_atual: number;
  estoque_minimo: number;
  cod_fornecedor: number;
  fornecedor_nome?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateItemRequest {
  cod_sku: string;
  descricao_item: string;
  preco_custo: number;
  preco_venda: number;
  estoque_atual: number;
  estoque_minimo: number;
  cod_fornecedor: number;
}

export interface UpdateItemRequest extends Partial<CreateItemRequest> {
  active?: boolean;
}

export interface ItemQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  cod_fornecedor?: number;
  active?: boolean;
  ordering?: string;
}
```

## 🏢 Serviço de Fornecedores

### Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/suppliers/` | Listar fornecedores |
| GET | `/suppliers/{id}/` | Buscar fornecedor por ID |
| POST | `/suppliers/` | Criar novo fornecedor |
| PUT | `/suppliers/{id}/` | Atualizar fornecedor |
| DELETE | `/suppliers/{id}/` | Deletar fornecedor |

### Implementação

```typescript
// services/supplierService.ts
class SupplierService {
  async getSuppliers(params?: SupplierQueryParams): Promise<PaginatedResponse<Supplier>> {
    const response = await api.get('/suppliers/', { params });
    return response.data;
  }

  async getSupplierById(id: number): Promise<Supplier> {
    const response = await api.get(`/suppliers/${id}/`);
    return response.data;
  }

  async createSupplier(data: CreateSupplierRequest): Promise<Supplier> {
    const response = await api.post('/suppliers/', data);
    return response.data;
  }

  async updateSupplier(id: number, data: UpdateSupplierRequest): Promise<Supplier> {
    const response = await api.put(`/suppliers/${id}/`, data);
    return response.data;
  }

  async deleteSupplier(id: number): Promise<void> {
    await api.delete(`/suppliers/${id}/`);
  }
}
```

### Tipos TypeScript

```typescript
// types/supplier.ts
export interface Supplier {
  id: number;
  nome_fornecedor: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSupplierRequest {
  nome_fornecedor: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {
  active?: boolean;
}
```

## 📊 Serviço de Transações

### Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/transactions/` | Listar transações |
| GET | `/transactions/{id}/` | Buscar transação por ID |
| POST | `/transactions/` | Criar nova transação |
| GET | `/transactions/entries/` | Listar entradas |
| GET | `/transactions/exits/` | Listar saídas |
| POST | `/transactions/entries/` | Criar entrada |
| POST | `/transactions/exits/` | Criar saída |

### Implementação

```typescript
// services/transactionService.ts
class TransactionService {
  async getTransactions(params?: TransactionQueryParams): Promise<PaginatedResponse<Transaction>> {
    const response = await api.get('/transactions/', { params });
    return response.data;
  }

  async getTransactionById(id: number): Promise<Transaction> {
    const response = await api.get(`/transactions/${id}/`);
    return response.data;
  }

  async getEntries(params?: EntryQueryParams): Promise<PaginatedResponse<Entry>> {
    const response = await api.get('/transactions/entries/', { params });
    return response.data;
  }

  async getExits(params?: ExitQueryParams): Promise<PaginatedResponse<Exit>> {
    const response = await api.get('/transactions/exits/', { params });
    return response.data;
  }

  async createEntry(data: CreateEntryRequest): Promise<Entry> {
    const response = await api.post('/transactions/entries/', data);
    return response.data;
  }

  async createExit(data: CreateExitRequest): Promise<Exit> {
    const response = await api.post('/transactions/exits/', data);
    return response.data;
  }
}
```

## 🔄 Padrões de Resposta

### Resposta Paginada

```typescript
// types/api.ts
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface QueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}
```

### Resposta de Erro

```typescript
export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: string | string[] | undefined;
}

export interface ValidationError {
  [field: string]: string[];
}
```

## 🛡️ Tratamento de Erros

### Interceptors de Erro

```typescript
// services/api.ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratamento global de erros
    if (error.response?.status === 401) {
      // Redirecionar para login
      router.push('/login');
    }
    
    if (error.response?.status === 403) {
      // Mostrar erro de permissão
      notificationStore.error('Erro', 'Você não tem permissão para esta ação');
    }
    
    return Promise.reject(error);
  }
);
```

### Tratamento de Erros de Validação

```typescript
// composables/useApiError.ts
export function useErrorHandler() {
  const handleError = (error: unknown, customTitle?: string) => {
    if (isValidationError(error)) {
      const message = parseValidationErrors(error);
      notificationStore.error(customTitle || 'Dados inválidos', message);
    } else if (isApiError(error)) {
      notificationStore.error(customTitle || 'Erro', error.message || 'Erro desconhecido');
    } else {
      notificationStore.error(customTitle || 'Erro', 'Erro interno do servidor');
    }
  };

  return { handleError };
}
```

## 🔐 Autenticação e Autorização

### Interceptor de Requisição

```typescript
// services/api.ts
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

### Renovação Automática de Token

```typescript
// services/authService.ts
class AuthService {
  private async refreshTokenIfNeeded(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return;

    try {
      const response = await api.post('/auth/refresh/', {
        refresh: refreshToken
      });
      
      localStorage.setItem('access_token', response.data.access);
    } catch (error) {
      // Token inválido, fazer logout
      this.logout();
    }
  }
}
```

## 📊 Cache e Performance

### Cache de Requisições

```typescript
// utils/cache.ts
class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl = 5 * 60 * 1000; // 5 minutos

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}
```

### Debounce para Busca

```typescript
// composables/useSearch.ts
export function useSearch<T>(
  searchFn: (query: string) => Promise<T[]>,
  delay = 300
) {
  const results = ref<T[]>([]);
  const loading = ref(false);
  const query = ref('');

  const debouncedSearch = debounce(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      results.value = [];
      return;
    }

    loading.value = true;
    try {
      results.value = await searchFn(searchQuery);
    } finally {
      loading.value = false;
    }
  }, delay);

  watch(query, debouncedSearch);

  return {
    query,
    results,
    loading
  };
}
```

## 🧪 Testes de API

### Mock de Serviços

```typescript
// test/mocks/apiMocks.ts
export const mockApiResponses = {
  items: {
    list: {
      count: 2,
      next: null,
      previous: null,
      results: [
        { id: 1, cod_sku: 'SKU001', descricao_item: 'Item 1' },
        { id: 2, cod_sku: 'SKU002', descricao_item: 'Item 2' }
      ]
    },
    create: { id: 3, cod_sku: 'SKU003', descricao_item: 'Item 3' }
  }
};

// Mock do axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    }))
  }
}));
```

### Testes de Serviços

```typescript
// services/__tests__/itemService.spec.ts
describe('ItemService', () => {
  let itemService: ItemService;

  beforeEach(() => {
    itemService = new ItemService();
  });

  it('should fetch items', async () => {
    const mockResponse = mockApiResponses.items.list;
    api.get.mockResolvedValue({ data: mockResponse });

    const result = await itemService.getItems();

    expect(api.get).toHaveBeenCalledWith('/items/', { params: undefined });
    expect(result).toEqual(mockResponse);
  });

  it('should create item', async () => {
    const itemData = { cod_sku: 'SKU003', descricao_item: 'Item 3' };
    const mockResponse = mockApiResponses.items.create;
    api.post.mockResolvedValue({ data: mockResponse });

    const result = await itemService.createItem(itemData);

    expect(api.post).toHaveBeenCalledWith('/items/', itemData);
    expect(result).toEqual(mockResponse);
  });
});
```

## 📝 Logging e Monitoramento

### Log de Requisições

```typescript
// services/api.ts
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data
    });
    return config;
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error(`[API] ${error.response?.status} ${error.config?.url}`, {
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);
```

## 🚀 Otimizações

### Request Deduplication

```typescript
// utils/requestDeduplication.ts
class RequestDeduplication {
  private pendingRequests = new Map<string, Promise<any>>();

  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }
}
```

### Retry Logic

```typescript
// utils/retry.ts
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError!;
}
```

---

**Última atualização**: Dezembro 2024  
**Versão**: 1.0.0  
**Mantenedor**: Equipe de Desenvolvimento Stock Control
