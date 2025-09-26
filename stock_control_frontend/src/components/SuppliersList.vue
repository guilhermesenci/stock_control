<!-- SuppliersList.vue -->
<template>
    <div class="list-container">
      <BaseTable
        v-if="!loading"
        :columns="columns"
        :rows="suppliers"
        :sortKey="pagination.sortKey.value"
        :sortOrder="pagination.sortOrder.value"
        keyField="codFornecedor"
        @update:sort="handleSort"
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
  
  // Configurar paginação
  const pagination = usePagination({
    pageSize: 10,
    initialPage: 1,
    initialSort: { key: 'nomeFornecedor', order: 'asc' }
  });
  
  // colunas
  const columns: ColumnDef<Fornecedor>[] = [
    { key: 'nomeFornecedor', label: 'Nome do Fornecedor', sortable: true },
    { key: 'active', label: 'Está ativo?', sortable: true },
    { key: 'edit' as keyof Fornecedor, label: 'Editar fornecedor' },
    { key: 'delete' as keyof Fornecedor, label: 'Deletar fornecedor' },
  ]
  
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
      
      // Adicionar parâmetros de paginação e ordenação
      const queryParams = pagination.getQueryParams();
      apiFilters.ordering = queryParams.ordering;
      apiFilters.page_size = queryParams.page_size;
      
      console.log('SuppliersList: Filtros para API:', apiFilters)
      
      const result = await supplierService.getSuppliers(
        parseInt(queryParams.page), 
        apiFilters
      )
      
      console.log('SuppliersList: Resultado da busca:', result)
      suppliers.value = result.results
      pagination.updateTotalItems(result.count)
      console.log('SuppliersList: Fornecedores atualizados:', suppliers.value)
    } catch (error) {
      console.error('SuppliersList: Erro ao buscar fornecedores:', error)
      handleApiError(error)
    } finally {
      loading.value = false
    }
  }
  
  // Função para ordenar
  function handleSort(key: string) {
    pagination.setSort(key);
  }
  
  // busca inicial
  onMounted(fetchSuppliers)
  
  // observa mudanças nos filtros
  watch(
    () => props.filters,
    () => {
      console.log('SuppliersList: Filtros mudaram, buscando novamente')
      pagination.reset();
      fetchSuppliers()
    },
    { deep: true }
  )
  
  // observa mudanças no refreshKey
  watch(
    () => props.refreshKey,
    () => {
      console.log('SuppliersList: refreshKey mudou, buscando novamente')
      pagination.reset();
      fetchSuppliers()
    }
  )
  
  // reagir a mudanças de paginação e ordenação
  watch([
    () => pagination.currentPage.value,
    () => pagination.sortKey.value,
    () => pagination.sortOrder.value,
    () => pagination.pageSize.value
  ], () => {
    fetchSuppliers();
  });
  
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