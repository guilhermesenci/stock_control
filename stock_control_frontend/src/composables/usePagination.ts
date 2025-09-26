/**
 * Composable para gerenciar paginação e ordenação no frontend.
 * Integra com APIs do backend que suportam ordenação.
 */

import { ref, computed, watch } from 'vue'

export interface PaginationState {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface SortState {
  sortKey: string | null
  sortOrder: 'asc' | 'desc'
}

export interface PaginationOptions {
  pageSize?: number
  initialPage?: number
  initialSort?: {
    key: string
    order: 'asc' | 'desc'
  }
}

export function usePagination(options: PaginationOptions = {}) {
  const {
    pageSize = 10,
    initialPage = 1,
    initialSort = { key: '', order: 'asc' as const }
  } = options

  // Estado da paginação
  const currentPage = ref(initialPage)
  const totalItems = ref(0)
  const pageSizeRef = ref(pageSize)

  // Estado da ordenação
  const sortKey = ref<string | null>(initialSort.key || null)
  const sortOrder = ref<'asc' | 'desc'>(initialSort.order)

  // Computed properties
  const totalPages = computed(() => Math.ceil(totalItems.value / pageSizeRef.value))
  
  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPreviousPage = computed(() => currentPage.value > 1)

  const paginationState = computed<PaginationState>(() => ({
    currentPage: currentPage.value,
    pageSize: pageSizeRef.value,
    totalItems: totalItems.value,
    totalPages: totalPages.value
  }))

  const sortState = computed<SortState>(() => ({
    sortKey: sortKey.value,
    sortOrder: sortOrder.value
  }))

  // Métodos de paginação
  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  function nextPage() {
    if (hasNextPage.value) {
      currentPage.value++
    }
  }

  function previousPage() {
    if (hasPreviousPage.value) {
      currentPage.value--
    }
  }

  function firstPage() {
    currentPage.value = 1
  }

  function lastPage() {
    currentPage.value = totalPages.value
  }

  // Métodos de ordenação
  function setSort(key: string) {
    if (sortKey.value === key) {
      // Alternar ordem se a mesma coluna for clicada
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      // Nova coluna, começar com ordem ascendente
      sortKey.value = key
      sortOrder.value = 'asc'
    }
    // Voltar para primeira página quando ordenar
    currentPage.value = 1
  }

  function clearSort() {
    sortKey.value = null
    sortOrder.value = 'asc'
    currentPage.value = 1
  }

  // Métodos de atualização
  function updateTotalItems(total: number) {
    totalItems.value = total
    // Ajustar página atual se necessário
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
      currentPage.value = totalPages.value
    }
  }

  function updatePageSize(newSize: number) {
    pageSizeRef.value = newSize
    currentPage.value = 1 // Voltar para primeira página
  }

  // Reset completo
  function reset() {
    currentPage.value = initialPage
    totalItems.value = 0
    pageSizeRef.value = pageSize
    sortKey.value = initialSort.key || null
    sortOrder.value = initialSort.order
  }

  // Gerar parâmetros de query para API
  function getQueryParams() {
    const params: Record<string, string> = {
      page: currentPage.value.toString(),
      page_size: pageSizeRef.value.toString()
    }

    if (sortKey.value) {
      const orderPrefix = sortOrder.value === 'desc' ? '-' : ''
      params.ordering = `${orderPrefix}${sortKey.value}`
    }

    return params
  }

  // Gerar parâmetros de query como string
  function getQueryString() {
    const params = getQueryParams()
    return new URLSearchParams(params).toString()
  }

  return {
    // Estado
    currentPage,
    totalItems,
    pageSize: pageSizeRef,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    sortKey,
    sortOrder,
    paginationState,
    sortState,

    // Métodos de paginação
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,

    // Métodos de ordenação
    setSort,
    clearSort,

    // Métodos de atualização
    updateTotalItems,
    updatePageSize,
    reset,

    // Utilitários
    getQueryParams,
    getQueryString
  }
}
