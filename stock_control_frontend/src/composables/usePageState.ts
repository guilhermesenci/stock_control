// src/composables/usePageState.ts
import { ref, computed } from 'vue';
import { useErrorHandler } from './useApiError';

export interface PageState {
  loading: boolean;
  error: string | null;
  data: any;
  empty: boolean;
}

/**
 * Composable para gerenciar estados de página (loading, error, empty, data)
 */
export function usePageState(initialData: any = null) {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const data = ref(initialData);
  const { handleError } = useErrorHandler();

  const isEmpty = computed(() => {
    if (Array.isArray(data.value)) {
      return data.value.length === 0;
    }
    return !data.value;
  });

  const hasData = computed(() => !isEmpty.value && !error.value);

  const setLoading = (state: boolean) => {
    loading.value = state;
    if (state) {
      error.value = null; // Limpa erro quando inicia loading
    }
  };

  const setError = (err: string | Error | any) => {
    loading.value = false;
    if (typeof err === 'string') {
      error.value = err;
    } else {
      error.value = err?.message || 'Ocorreu um erro inesperado';
    }
  };

  const setData = (newData: any) => {
    loading.value = false;
    error.value = null;
    data.value = newData;
  };

  const clearError = () => {
    error.value = null;
  };

  const reset = () => {
    loading.value = false;
    error.value = null;
    data.value = initialData;
  };

  /**
   * Executa uma função assíncrona com controle de estado da página
   */
  const execute = async <T>(
    asyncFn: () => Promise<T>,
    options: {
      showErrorNotification?: boolean;
      clearDataOnError?: boolean;
    } = {}
  ): Promise<T | null> => {
    const { showErrorNotification = true, clearDataOnError = false } = options;

    try {
      setLoading(true);
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      
      if (clearDataOnError) {
        data.value = initialData;
      }
      
      if (showErrorNotification) {
        handleError(err);
      }
      
      return null;
    }
  };

  /**
   * Executa uma função assíncrona que retorna dados paginados
   */
  const executePaginated = async <T>(
    asyncFn: () => Promise<{ results: T[]; count: number; [key: string]: any }>,
    options: {
      append?: boolean;
      showErrorNotification?: boolean;
    } = {}
  ): Promise<{ results: T[]; count: number; [key: string]: any } | null> => {
    const { append = false, showErrorNotification = true } = options;

    try {
      setLoading(true);
      const result = await asyncFn();
      
      if (append && Array.isArray(data.value)) {
        data.value = [...data.value, ...result.results];
      } else {
        setData(result.results);
      }
      
      return result;
    } catch (err) {
      setError(err);
      
      if (showErrorNotification) {
        handleError(err);
      }
      
      return null;
    }
  };

  return {
    // Estado
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    data: computed(() => data.value),
    empty: isEmpty,
    hasData,
    
    // Métodos
    setLoading,
    setError,
    setData,
    clearError,
    reset,
    execute,
    executePaginated,
  };
}

/**
 * Composable para gerenciar listas com paginação
 */
export function usePaginatedList<T>(
  fetchFn: (page: number, filters?: any) => Promise<{ results: T[]; count: number; [key: string]: any }>,
  initialFilters: any = {}
) {
  const pageState = usePageState([]);
  const currentPage = ref(1);
  const totalPages = ref(0);
  const totalCount = ref(0);
  const filters = ref(initialFilters);
  const hasMore = computed(() => currentPage.value < totalPages.value);

  const loadPage = async (page: number = 1, newFilters?: any) => {
    if (newFilters) {
      filters.value = { ...filters.value, ...newFilters };
    }

    const result = await pageState.executePaginated(
      () => fetchFn(page, filters.value),
      { append: page > 1 }
    );

    if (result) {
      currentPage.value = page;
      totalCount.value = result.count;
      totalPages.value = Math.ceil(result.count / (result.page_size || 20));
    }

    return result;
  };

  const loadNextPage = async () => {
    if (hasMore.value) {
      return await loadPage(currentPage.value + 1);
    }
    return null;
  };

  const refresh = async () => {
    currentPage.value = 1;
    pageState.setData([]);
    return await loadPage(1);
  };

  const applyFilters = async (newFilters: any) => {
    currentPage.value = 1;
    pageState.setData([]);
    return await loadPage(1, newFilters);
  };

  return {
    ...pageState,
    currentPage: computed(() => currentPage.value),
    totalPages: computed(() => totalPages.value),
    totalCount: computed(() => totalCount.value),
    hasMore,
    filters: computed(() => filters.value),
    loadPage,
    loadNextPage,
    refresh,
    applyFilters,
  };
}
