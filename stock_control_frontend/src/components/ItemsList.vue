<!-- ItemsList.vue -->
<template>
    <div>
      <BaseTable
        v-if="!loading"
        :columns="columns"
        :rows="table.data.value"
        :sortKey="table.sortKey.value"
        :sortOrder="table.sortOrder.value"
        keyField="codSku"
        @update:sort="table.setSort"
      >
        <template #cell-active="{ value }">
          {{ value ? 'Sim' : 'Não' }}
        </template>
        <template #cell-edit="{ row }">
          <button class="btn-edit" @click="onEdit(row)">
            Editar item
          </button>
        </template>
        <template #cell-delete="{ row }">
          <button class="btn-delete" @click="onDelete(row)">
            Deletar item
          </button>
        </template>
      </BaseTable>
      <div v-else class="loading">Carregando itens...</div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, watch } from 'vue'
  import BaseTable from '@/components/BaseTable.vue'
  import { useTable } from '@/composables/useTable'
  import { itemService, type Item } from '@/services/itemService'
  import { handleApiError } from '@/composables/useApiError'
  
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
  
  // colunas
  const columns = [
    { key: 'codSku' as keyof Item, label: 'Código SKU', sortable: true },
    { key: 'descricaoItem' as keyof Item, label: 'Descrição', sortable: true },
    { key: 'unidMedida' as keyof Item, label: 'Unidade de Medida', sortable: true },
    { key: 'active' as keyof Item, label: 'Está ativo?', sortable: true },
    { key: 'edit' as keyof Item, label: 'Editar item', sortable: false },
    { key: 'delete' as keyof Item, label: 'Deletar item', sortable: false },
  ]
  
  // composable de ordenação/filtros locais
  const table = useTable<Item>(items, columns)
  
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
      
      console.log('ItemsList: Filtros mapeados para o serviço:', serviceFilters)
      
      const result = await itemService.getItems(1, serviceFilters)
      console.log('ItemsList: Resultado da busca:', result)
      
      items.value = result.results
      
      console.log('ItemsList: Itens mapeados:', items.value)
    } catch (error) {
      console.error('ItemsList: Erro ao buscar itens:', error)
    } finally {
      loading.value = false
    }
  }
  
  // Busca inicial
  onMounted(() => {
    console.log('ItemsList: Componente montado')
    fetchItems()
  })
  
  // Observa mudanças nos filtros e refreshKey
  watch(
    [() => props.filters, () => props.refreshKey],
    ([newFilters, newRefreshKey]) => {
      console.log('ItemsList: Watcher detectou mudança')
      console.log('ItemsList: refreshKey:', newRefreshKey)
      console.log('ItemsList: Filtros:', newFilters)
      fetchItems()
    }
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
  
  <style scoped>
  .loading {
    padding: 1rem;
    text-align: center;
    color: #666;
  }
  .btn-edit {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    border: 1px solid #007bff;
    background: white;
    color: #007bff;
    border-radius: 4px;
    cursor: pointer;
  }
  .btn-edit:hover {
    background: #007bff;
    color: white;
  }
  .btn-delete {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    border: 1px solid #dc3545;
    background: white;
    color: #dc3545;
    border-radius: 4px;
    cursor: pointer;
  }
  .btn-delete:hover {
    background: #dc3545;
    color: white;
  }
  </style>
  