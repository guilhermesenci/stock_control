# Guia de Testes - Stock Control Frontend

Este documento descreve como executar e entender os testes unitários do projeto Stock Control Frontend.

## Configuração

O projeto utiliza **Vitest** como framework de testes, configurado com:
- **Vue Test Utils** para testes de componentes Vue
- **jsdom** como ambiente de testes
- **Pinia** para testes de stores
- **Mocks** para serviços e APIs

## Estrutura dos Testes

```
src/
├── test/
│   ├── setup.ts          # Configuração global dos testes
│   ├── utils.ts          # Utilitários para testes
│   └── test-runner.ts    # Runner de testes
├── components/__tests__/ # Testes de componentes
├── composables/__tests__/ # Testes de composables
├── services/__tests__/   # Testes de serviços
├── stores/__tests__/     # Testes de stores
└── utils/__tests__/      # Testes de utilitários
```

## Comandos de Teste

### Executar todos os testes
```bash
npm run test:unit
```

### Executar testes em modo watch
```bash
npm run test:unit -- --watch
```

### Executar testes com coverage
```bash
npm run test:unit -- --coverage
```

### Executar testes específicos
```bash
# Testes de componentes
npm run test:unit -- src/components/__tests__/

# Testes de serviços
npm run test:unit -- src/services/__tests__/

# Testes de composables
npm run test:unit -- src/composables/__tests__/

# Testes de stores
npm run test:unit -- src/stores/__tests__/
```

## Tipos de Testes

### 1. Testes de Componentes
Testam a renderização, interações e comportamento dos componentes Vue.

**Exemplo:**
```typescript
// BaseTable.spec.ts
describe('BaseTable', () => {
  it('renderiza corretamente', () => {
    const wrapper = createWrapper(BaseTable, { props: { ... } })
    expect(wrapper.find('.table-container').exists()).toBe(true)
  })
})
```

### 2. Testes de Serviços
Testam a lógica de negócio e integração com APIs.

**Exemplo:**
```typescript
// authService.spec.ts
describe('authService', () => {
  it('faz login com credenciais válidas', async () => {
    const result = await authService.login('user', 'pass')
    expect(result.access).toBeDefined()
  })
})
```

### 3. Testes de Composables
Testam a lógica reativa e funções utilitárias.

**Exemplo:**
```typescript
// useTable.spec.ts
describe('useTable', () => {
  it('filtra dados corretamente', () => {
    const { setFilter, data } = useTable(rows, columns)
    setFilter('status', 'active')
    expect(data.value).toHaveLength(2)
  })
})
```

### 4. Testes de Stores (Pinia)
Testam o gerenciamento de estado global.

**Exemplo:**
```typescript
// auth.spec.ts
describe('useAuthStore', () => {
  it('faz login com sucesso', async () => {
    const store = useAuthStore()
    await store.login({ username: 'user', password: 'pass' })
    expect(store.isAuthenticated).toBe(true)
  })
})
```

## Utilitários de Teste

### createWrapper
Função utilitária para criar wrappers de componentes com configurações padrão:
```typescript
const wrapper = createWrapper(Component, {
  props: { ... },
  slots: { ... }
})
```

### mockData
Dados mock para testes:
```typescript
import { mockData } from '@/test/utils'

const user = mockData.user
const supplier = mockData.supplier
```

### mockApiResponses
Respostas mock da API:
```typescript
import { mockApiResponses } from '@/test/utils'

const loginResponse = mockApiResponses.login
```

## Mocks Configurados

- **localStorage/sessionStorage**: Mockados para testes
- **axios**: Mockado para simular chamadas de API
- **vue-router**: Mockado para testes de navegação
- **Pinia**: Configurado para testes de stores
- **console**: Mockado para evitar logs durante testes

## Cobertura de Testes

O projeto está configurado para gerar relatórios de cobertura que mostram:
- **Statements**: Percentual de linhas executadas
- **Branches**: Percentual de branches testados
- **Functions**: Percentual de funções testadas
- **Lines**: Percentual de linhas de código testadas

## Boas Práticas

### 1. Nomenclatura
- Use `describe` para agrupar testes relacionados
- Use `it` ou `test` para casos de teste individuais
- Use nomes descritivos que expliquem o comportamento esperado

### 2. Organização
- Um arquivo de teste por arquivo de código
- Agrupe testes relacionados em `describe` blocks
- Use `beforeEach` e `afterEach` para setup e cleanup

### 3. Mocks
- Mock dependências externas
- Use dados mock consistentes
- Limpe mocks entre testes

### 4. Assertions
- Use assertions específicas e descritivas
- Teste tanto casos de sucesso quanto de erro
- Verifique side effects quando apropriado

## Exemplos de Testes

### Teste de Componente com Props
```typescript
it('renderiza com props corretas', () => {
  const wrapper = createWrapper(Component, {
    props: { title: 'Test Title', count: 5 }
  })
  
  expect(wrapper.find('h1').text()).toBe('Test Title')
  expect(wrapper.find('.count').text()).toBe('5')
})
```

### Teste de Evento
```typescript
it('emite evento ao clicar', async () => {
  const wrapper = createWrapper(Component)
  
  await wrapper.find('button').trigger('click')
  
  expect(wrapper.emitted('click')).toBeTruthy()
  expect(wrapper.emitted('click')[0]).toEqual([expectedData])
})
```

### Teste Assíncrono
```typescript
it('carrega dados da API', async () => {
  const mockData = { id: 1, name: 'Test' }
  mockApi.get.mockResolvedValue({ data: mockData })
  
  const wrapper = createWrapper(Component)
  await wrapper.vm.loadData()
  
  expect(wrapper.vm.data).toEqual(mockData)
})
```

## Troubleshooting

### Problemas Comuns

1. **Erro de import**: Verifique se os caminhos de import estão corretos
2. **Mock não funciona**: Certifique-se de que o mock está configurado antes do import
3. **Teste falha**: Verifique se os dados mock estão corretos
4. **Timeout**: Aumente o timeout para operações assíncronas

### Debug
```bash
# Executar com logs detalhados
npm run test:unit -- --reporter=verbose

# Executar um teste específico
npm run test:unit -- --run BaseTable.spec.ts
```

## Contribuindo

Ao adicionar novos testes:
1. Siga a estrutura existente
2. Use os utilitários fornecidos
3. Mantenha a cobertura de testes alta
4. Documente casos especiais
5. Execute todos os testes antes de fazer commit
