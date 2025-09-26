# Guia de Paginação e Ordenação

Este documento explica como usar o novo sistema de paginação e ordenação implementado no frontend.

## Visão Geral

O sistema foi refatorado para transferir a responsabilidade de ordenação do frontend para o backend, mantendo a paginação já existente e melhorando a experiência do usuário.

## Componentes Principais

### 1. `usePagination` Composable

O composable `usePagination` gerencia o estado de paginação e ordenação:

```typescript
import { usePagination } from '@/composables/usePagination'

const pagination = usePagination({
  pageSize: 10,
  initialPage: 1,
  initialSort: { key: 'codSku', order: 'asc' }
})
```

**Funcionalidades:**
- Gerenciamento de estado de paginação (página atual, total de páginas, etc.)
- Gerenciamento de estado de ordenação (campo, direção)
- Métodos para navegação (próxima, anterior, ir para página específica)
- Geração automática de parâmetros de query para APIs
- Reset e atualização de estado

### 2. `PaginationControls` Component

Componente reutilizável para controles de paginação:

```vue
<PaginationControls
  :current-page="currentPage"
  :total-pages="totalPages"
  :total-items="totalItems"
  :page-size="pageSize"
  @go-to-page="goToPage"
  @change-page-size="changePageSize"
/>
```

**Funcionalidades:**
- Navegação entre páginas (primeira, anterior, próxima, última)
- Páginas numeradas com ellipsis para grandes datasets
- Seletor de tamanho de página
- Informações de paginação (página atual, total de itens)
- Design responsivo

### 3. `BaseTable` Atualizado

O componente `BaseTable` foi atualizado para suportar ordenação do backend:

```vue
<BaseTable
  :columns="columns"
  :rows="items"
  :sortKey="sortKey"
  :sortOrder="sortOrder"
  keyField="codSku"
  @update:sort="handleSort"
  @sort-changed="handleSortChanged"
/>
```

## Como Implementar em um Novo Componente

### 1. Configurar o Composable

```typescript
import { usePagination } from '@/composables/usePagination'

const pagination = usePagination({
  pageSize: 10,
  initialPage: 1,
  initialSort: { key: 'codSku', order: 'asc' }
})
```

### 2. Implementar a Função de Busca

```typescript
async function fetchItems() {
  loading.value = true;
  error.value = null;
  try {
    const queryParams = {
      ...pagination.getQueryParams(),
      ...props.filters
    };
    
    const result = await yourService.getItems(
      parseInt(queryParams.page), 
      queryParams
    );
    
    items.value = result.results;
    pagination.updateTotalItems(result.total);
  } catch (e) {
    console.error('Erro ao carregar itens:', e);
    error.value = 'Erro ao carregar itens';
  } finally {
    loading.value = false;
  }
}
```

### 3. Configurar Watchers

```typescript
// Busca dados quando os filtros mudam
watch(() => props.filters, (newFilters) => {
  pagination.reset();
  fetchItems();
}, { deep: true });

// Busca dados quando paginação ou ordenação mudam
watch([
  () => pagination.currentPage.value,
  () => pagination.sortKey.value,
  () => pagination.sortOrder.value,
  () => pagination.pageSize.value
], () => {
  fetchItems();
});
```

### 4. Expor Dados para o Template

```typescript
const currentPage = computed(() => pagination.currentPage.value);
const totalPages = computed(() => pagination.totalPages.value);
const totalItems = computed(() => pagination.totalItems.value);
const pageSize = computed(() => pagination.pageSize.value);
const sortKey = computed(() => pagination.sortKey.value);
const sortOrder = computed(() => pagination.sortOrder.value);
```

### 5. Implementar Handlers

```typescript
function goToPage(page: number) {
  pagination.goToPage(page);
}

function changePageSize(size: number) {
  pagination.updatePageSize(size);
}

function handleSort(key: string) {
  pagination.setSort(key);
}
```

## Backend - Suporte a Ordenação

### Filtros com Ordenação

Todos os filtros Django foram atualizados para suportar ordenação:

```python
class ItemFilter(django_filters.FilterSet):
    # ... outros filtros ...
    
    # Ordenação
    ordering = django_filters.OrderingFilter(
        fields=(
            ('cod_sku', 'codSku'),
            ('descricao_item', 'descricaoItem'),
            ('unid_medida', 'unidMedida'),
            ('active', 'active'),
        ),
        field_labels={
            'cod_sku': 'Código SKU',
            'descricao_item': 'Descrição',
            'unid_medida': 'Unidade de Medida',
            'active': 'Ativo',
        }
    )
```

### ViewSets com Ordenação

Os ViewSets foram configurados para usar os filtros com ordenação:

```python
class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filterset_class = ItemFilter
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ['cod_sku', 'descricao_item', 'unid_medida', 'active']
    ordering = ['cod_sku']  # Ordenação padrão
```

## Parâmetros de Query

### Paginação
- `page`: Número da página (padrão: 1)
- `page_size`: Tamanho da página (padrão: 10)

### Ordenação
- `ordering`: Campo para ordenação
  - `codSku`: Ordenação ascendente por SKU
  - `-codSku`: Ordenação descendente por SKU
  - `codSku,descricaoItem`: Ordenação múltipla

### Exemplo de URL
```
/api/v1/items/?page=2&page_size=20&ordering=-descricaoItem
```

## Migração de Componentes Existentes

### Antes (Frontend Sorting)
```typescript
const table = useTable<Item>(items, columns);
// Ordenação feita no frontend
```

### Depois (Backend Sorting)
```typescript
const pagination = usePagination({
  pageSize: 10,
  initialPage: 1,
  initialSort: { key: 'codSku', order: 'asc' }
});
// Ordenação feita no backend
```

## Benefícios

1. **Performance**: Ordenação no backend é mais eficiente para grandes datasets
2. **Consistência**: Dados sempre ordenados corretamente, mesmo com paginação
3. **Escalabilidade**: Suporta grandes volumes de dados
4. **Reutilização**: Componentes de paginação reutilizáveis
5. **Manutenibilidade**: Código mais limpo e organizado

## Exemplo Completo

Veja o arquivo `ItemsListWithPagination.vue` para um exemplo completo de implementação.

## Troubleshooting

### Problema: Ordenação não funciona
**Solução**: Verifique se o backend está configurado com `OrderingFilter` e se os campos estão corretos.

### Problema: Paginação não atualiza
**Solução**: Certifique-se de que os watchers estão configurados corretamente e que `fetchItems()` está sendo chamado.

### Problema: Performance lenta
**Solução**: Verifique se os índices estão criados no banco de dados para os campos de ordenação.
