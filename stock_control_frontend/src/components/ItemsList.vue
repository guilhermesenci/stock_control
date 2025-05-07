<!-- ItemsList.vue -->
<template>
    <div>
      <BaseTable
        v-if="items"
        :columns="columns"
        :rows="items"
        :sortKey="table.sortKey.value"
        :sortOrder="table.sortOrder.value"
        keyField="sku"
        @update:sort="(key) => table.setSort(key as keyof Item)"
      >
        <template #cell-active="{ value }">
          {{ value ? 'Sim' : 'Não' }}
        </template>
        <template #cell-edit="{ row }">
          <button class="btn-edit" @click="onEdit(row)">
            Editar item
          </button>
        </template>
      </BaseTable>
      <div v-else class="loading">Carregando itens...</div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch, onMounted } from 'vue'
  import BaseTable from '@/components/BaseTable.vue'
  import { useTable, type ColumnDef } from '@/composables/useTable'
  import { itemService } from '@/services/itemService'
  import { handleApiError } from '@/composables/useApiError'
  
  interface Item {
    sku: string
    description: string
    unityMeasure: string
    active: boolean
  }
  
  interface Props {
    filters: {
      itemSKU: string
      itemDescription: string
      showOnlyActiveItems: boolean
    }
    refreshKey: number
  }
  
  // 1 única chamada
  const props = defineProps<Props>()
  const { filters, refreshKey } = props
  
  // estado local
  const rawItems = ref<Item[] | null>(null)
  const items = ref<Item[]>([])
  
  // colunas
  const columns: ColumnDef<Item>[] = [
    { key: 'sku',           label: 'SKU',                    sortable: true },
    { key: 'description',   label: 'Descrição do Produto',  sortable: true },
    { key: 'unityMeasure',  label: 'Unidade de medida',      sortable: true },
    { key: 'active',        label: 'Está ativo?',           sortable: true },
    { key: 'edit' as keyof Item, label: 'Editar item',      sortable: false },
  ]
  
  // composable de ordenação/filtros locais
  const table = useTable<Item>(items, columns)
  
  // busca na API
  async function fetchItems() {
    try {
      rawItems.value = null
      const paginated = await itemService.getItems(1)
      const mapped = paginated.items.map(i => ({
        sku: String(i.codSku),
        description: i.descricaoItem,
        unityMeasure: i.unidMedida,
        active: true,
      }))
      rawItems.value = mapped
      applyFiltersAndSort()
    } catch (err) {
      handleApiError(err)
    }
  }
  
  // aplica filtros locais
  function applyFiltersAndSort() {
    if (!rawItems.value) return
    items.value = rawItems.value.filter(item => {
      const matchesSKU = item.sku.includes(filters.itemSKU)
      const matchesDesc = item.description
        .toLowerCase()
        .includes(filters.itemDescription.toLowerCase())
      const matchesActive = !filters.showOnlyActiveItems || item.active
      return matchesSKU && matchesDesc && matchesActive
    })
  }
  
  // monta e refaz ao mudar filtros ou refreshKey
  onMounted(fetchItems)
  watch([() => filters, () => refreshKey], fetchItems, { deep: true })
  
  // ação de editar
  function onEdit(item: Item) {
    console.log('Editar item:', item)
  }
  </script>
  
  <style scoped>
  .loading {
    padding: 1rem;
    text-align: center;
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
  </style>
  