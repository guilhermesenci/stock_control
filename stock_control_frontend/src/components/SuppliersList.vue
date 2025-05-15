<!-- SuppliersList.vue -->
<template>
    <div class="list-container">
      <BaseTable
        v-if="!loading"
        :columns="columns"
        :rows="table.data.value"
        :sortKey="table.sortKey.value"
        :sortOrder="table.sortOrder.value"
        keyField="codFornecedor"
        @update:sort="(key) => table.setSort(key as keyof Fornecedor)"
      >
        <template #cell-nomeFornecedor="{ value, row }">
          {{ console.log('Cell template - value:', value, 'row:', row) }}
          {{ value }}
        </template>
        <template #cell-active="{ value }">
          {{ value ? 'Sim' : 'Não' }}
        </template>
        <template #cell-edit="{ row }">
          <button class="btn-edit table-btn" @click="onEdit(row)">
            Editar fornecedor
          </button>
        </template>
        <template #cell-delete="{ row }">
          <button class="btn-delete table-btn" @click="onDelete(row)">
            Deletar fornecedor
          </button>
        </template>
      </BaseTable>
      <div v-else class="loading">Carregando fornecedores...</div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, watch } from 'vue'
  import BaseTable from '@/components/BaseTable.vue'
  import { useTable } from '@/composables/useTable'
  import { supplierService, type Fornecedor } from '@/services/supplierService'
  import { handleApiError } from '@/composables/useApiError'
  import type { ColumnDef } from '@/composables/useTable'
  
  const props = defineProps<{
    filters: Record<string, string | boolean>
    refreshKey: number
  }>()
  
  const emit = defineEmits<{
    (e: 'edit', supplier: Fornecedor): void
    (e: 'delete', supplier: Fornecedor): void
  }>()
  
  const loading = ref(false)
  const suppliers = ref<Fornecedor[]>([])
  
  // colunas
  const columns: ColumnDef<Fornecedor>[] = [
    { key: 'nomeFornecedor', label: 'Nome do Fornecedor', sortable: true },
    { key: 'active', label: 'Está ativo?', sortable: true },
    { key: 'edit' as keyof Fornecedor, label: 'Editar fornecedor' },
    { key: 'delete' as keyof Fornecedor, label: 'Deletar fornecedor' },
  ]
  
  // composable de ordenação/filtros locais
  const table = useTable<Fornecedor>(suppliers, columns)
  
  // busca na API
  async function fetchSuppliers() {
    loading.value = true
    try {
      console.log('SuppliersList: Iniciando busca de fornecedores')
      console.log('SuppliersList: Filtros atuais:', props.filters)
      
      // Prepara os filtros para a API
      const apiFilters: Record<string, string | boolean> = {
        nomeFornecedor: props.filters.supplierName as string
      }
      
      // Só inclui o filtro active se showOnlyActive estiver marcado
      if (props.filters.showOnlyActive === true) {
        apiFilters.active = true
      }
      
      console.log('SuppliersList: Filtros para API:', apiFilters)
      
      const result = await supplierService.getSuppliers(1, apiFilters)
      
      console.log('SuppliersList: Resultado da busca:', result)
      suppliers.value = result.results
      console.log('SuppliersList: Fornecedores atualizados:', suppliers.value)
    } catch (error) {
      console.error('SuppliersList: Erro ao buscar fornecedores:', error)
      handleApiError(error)
    } finally {
      loading.value = false
    }
  }
  
  // busca inicial
  onMounted(fetchSuppliers)
  
  // observa mudanças nos filtros
  watch(
    () => props.filters,
    () => {
      console.log('SuppliersList: Filtros mudaram, buscando novamente')
      fetchSuppliers()
    },
    { deep: true }
  )
  
  // observa mudanças no refreshKey
  watch(
    () => props.refreshKey,
    () => {
      console.log('SuppliersList: refreshKey mudou, buscando novamente')
      fetchSuppliers()
    }
  )
  
  // handlers de eventos
  function onEdit(supplier: Fornecedor) {
    console.log('SuppliersList: Editando fornecedor:', supplier)
    emit('edit', supplier)
  }
  
  function onDelete(supplier: Fornecedor) {
    console.log('SuppliersList: Deletando fornecedor:', supplier)
    emit('delete', supplier)
  }
  </script>