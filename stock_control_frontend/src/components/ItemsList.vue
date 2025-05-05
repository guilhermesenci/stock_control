<!-- ItemsList.vue -->
<template>
    <div>
      <BaseTable
        :columns="columns"
        :rows="table.data.value"
        :sortKey="table.sortKey.value"
        :sortOrder="table.sortOrder.value"
        keyField="sku"
        @update:sort="(key) => table.setSort(key as keyof Item)"
      >
        <!-- render boolean -->
        <template #cell-active="{ value }">
          {{ value ? 'Sim' : 'Não' }}
        </template>
  
        <!-- render botão de editar -->
        <template #cell-edit="{ row }">
          <button class="btn-edit" @click="onEdit(row)">
            Editar item
          </button>
        </template>
      </BaseTable>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watchEffect } from 'vue'
  import BaseTable from '@/components/BaseTable.vue'
  import { useTable } from '@/composables/useTable'
  import type { ColumnDef } from '@/composables/useTable'
  
  interface Item {
    sku: string
    description: string
    unityMeasure: string
    active: boolean
  }
  
  // dados mock
  const items = ref<Item[]>([
    { sku: '12345', description: 'Produto A', unityMeasure: 'PC', active: true },
    { sku: '67890', description: 'Produto B', unityMeasure: 'PC', active: false },
    // ...
  ])
  
  // filtros
  const filters = ref({ sku: '', description: '' })
  
  // colunas, incluindo a coluna de ação 'edit'
  const columns: ColumnDef<Item>[] = [
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'description', label: 'Descrição do Produto', sortable: true },
    { key: 'unityMeasure', label: 'Unidade de medida', sortable: true },
    { key: 'active', label: 'Está ativo?', sortable: true },
    // coluna de ação (não ordenável)
    { key: 'edit' as keyof Item, label: 'Editar item', sortable: false }
  ]
  
  // inicializa useTable com colunas
  const table = useTable<Item>(items, columns)
  
  // sincroniza filtros
  watchEffect(() => {
    table.setFilter('sku', filters.value.sku)
    table.setFilter('description', filters.value.description)
  })
  
  // handler de edição
  function onEdit(item: Item) {
    // aqui você pode abrir modal de edição, navegar para rota, etc.
    console.log('Editar item:', item)
  }
  </script>
  
  <style scoped>
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
  