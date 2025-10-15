<!-- ItemsList.vue -->
<template>
  <div>
    <BaseTable
      v-if="!loading"
      :columns="columns"
      :rows="items"
      :sortKey="pagination.sortKey.value"
      :sortOrder="pagination.sortOrder.value"
      keyField="codSku"
      @update:sort="handleSort"
    >
      <template #cell-active="{ value }">
        {{ value ? 'Sim' : 'Não' }}
      </template>
      <template #cell-edit="{ row }">
        <button class="btn-edit table-btn" @click="onEdit(row)">Editar item</button>
      </template>
      <template #cell-delete="{ row }">
        <button class="btn-delete table-btn" @click="onDelete(row)">Deletar item</button>
      </template>
    </BaseTable>
    <div v-else class="loading">Carregando itens...</div>

    <PaginationControls
      :current-page="pagination.currentPage.value"
      :total-pages="pagination.totalPages.value"
      :total-items="pagination.totalItems.value"
      :page-size="pagination.pageSize.value"
      @go-to-page="pagination.goToPage"
      @change-page-size="pagination.updatePageSize"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import BaseTable from '@/components/BaseTable.vue'
import PaginationControls from '@/components/PaginationControls.vue'
import { usePagination } from '@/composables/usePagination'
import type { Item } from '@/types/item'
import { itemService } from '@/services/itemService'

const props = defineProps<{
  filters: Record<string, string | boolean>
  refreshKey: number
}>()

const emit = defineEmits<{
  (e: 'edit', item: Item): void
  (e: 'delete', item: Item): void
}>()

const loading = ref(false)
const items = ref<Item[]>([])

// Configurar paginação
const pagination = usePagination({
  pageSize: 10,
  initialPage: 1,
  initialSort: { key: 'codSku', order: 'asc' },
})

// colunas
const columns = [
  { key: 'codSku' as keyof Item, label: 'Código SKU', sortable: true },
  { key: 'descricaoItem' as keyof Item, label: 'Descrição', sortable: true },
  { key: 'unidMedida' as keyof Item, label: 'Unidade de Medida', sortable: true },
  { key: 'active' as keyof Item, label: 'Está ativo?', sortable: true },
  { key: 'edit' as keyof Item, label: 'Editar item', sortable: false },
  { key: 'delete' as keyof Item, label: 'Deletar item', sortable: false },
]

// busca na API
async function fetchItems() {
  try {
    console.log('ItemsList: Iniciando busca de itens')
    console.log('ItemsList: Filtros recebidos:', props.filters)

    loading.value = true
    items.value = [] // Limpa os itens antes de buscar novos

    // Mapeia os filtros para o formato esperado pelo serviço
    const serviceFilters: Record<string, string | boolean> = {}

    // Só adiciona os filtros se tiverem valor
    if (props.filters.itemSKU) {
      serviceFilters.codSku = props.filters.itemSKU as string
    }
    if (props.filters.itemDescription) {
      serviceFilters.descricaoItem = props.filters.itemDescription as string
    }
    // Só inclui o filtro de active se showOnlyActiveItems estiver marcado
    if (props.filters.showOnlyActiveItems === true) {
      serviceFilters.active = true
    }

    // Adicionar parâmetros de paginação e ordenação
    const queryParams = pagination.getQueryParams()
    serviceFilters.ordering = queryParams.ordering
    serviceFilters.page_size = queryParams.page_size

    console.log('ItemsList: Filtros mapeados para o serviço:', serviceFilters)
    console.log('ItemsList: Parâmetros de query:', queryParams)

    const result = await itemService.getItems(parseInt(queryParams.page), serviceFilters)
    console.log('ItemsList: Resultado da busca:', result)

    items.value = result.results
    pagination.updateTotalItems(result.count)

    console.log('ItemsList: Itens mapeados:', items.value)
  } catch (error) {
    console.error('ItemsList: Erro ao buscar itens:', error)
  } finally {
    loading.value = false
  }
}

// Função para ordenar
function handleSort(key: string) {
  pagination.setSort(key)
}

// Busca inicial
onMounted(() => {
  console.log('ItemsList: Componente montado')
  fetchItems()
})

// Observa mudanças nos filtros e refreshKey
watch([() => props.filters, () => props.refreshKey], ([newFilters, newRefreshKey]) => {
  console.log('ItemsList: Watcher detectou mudança')
  console.log('ItemsList: refreshKey:', newRefreshKey)
  console.log('ItemsList: Filtros:', newFilters)
  pagination.reset()
  fetchItems()
})

// reagir a mudanças de paginação e ordenação
watch(
  [
    () => pagination.currentPage.value,
    () => pagination.sortKey.value,
    () => pagination.sortOrder.value,
    () => pagination.pageSize.value,
  ],
  () => {
    fetchItems()
  },
)

// ação de editar
function onEdit(item: Item) {
  console.log('ItemsList: Editando item:', item)
  emit('edit', item)
}

// ação de deletar
function onDelete(item: Item) {
  console.log('ItemsList: Deletando item:', item)
  emit('delete', item)
}
</script>
