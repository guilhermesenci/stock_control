// src/composables/useLoading.ts
import { ref, computed } from 'vue';

/**
 * Composable para gerenciar estados de carregamento
 */
export function useLoading(initialState = false) {
  const loading = ref(initialState);
  const loadingStates = ref<Record<string, boolean>>({});

  const isLoading = computed(() => loading.value);
  const hasAnyLoading = computed(() => 
    loading.value || Object.values(loadingStates.value).some(state => state)
  );

  const setLoading = (state: boolean) => {
    loading.value = state;
  };

  const setLoadingState = (key: string, state: boolean) => {
    loadingStates.value[key] = state;
  };

  const getLoadingState = (key: string) => {
    return loadingStates.value[key] || false;
  };

  const clearLoadingStates = () => {
    loadingStates.value = {};
  };

  /**
   * Executa uma função assíncrona com controle de loading
   */
  const withLoading = async <T>(
    asyncFn: () => Promise<T>,
    loadingKey?: string
  ): Promise<T> => {
    try {
      if (loadingKey) {
        setLoadingState(loadingKey, true);
      } else {
        setLoading(true);
      }
      
      const result = await asyncFn();
      return result;
    } finally {
      if (loadingKey) {
        setLoadingState(loadingKey, false);
      } else {
        setLoading(false);
      }
    }
  };

  return {
    loading: isLoading,
    hasAnyLoading,
    setLoading,
    setLoadingState,
    getLoadingState,
    clearLoadingStates,
    withLoading,
  };
}

/**
 * Composable para gerenciar múltiplos estados de carregamento
 */
export function useMultipleLoading() {
  const loadingStates = ref<Record<string, boolean>>({});

  const isLoading = (key: string) => {
    return loadingStates.value[key] || false;
  };

  const setLoading = (key: string, state: boolean) => {
    loadingStates.value[key] = state;
  };

  const hasAnyLoading = computed(() => 
    Object.values(loadingStates.value).some(state => state)
  );

  const clearAll = () => {
    loadingStates.value = {};
  };

  return {
    isLoading,
    setLoading,
    hasAnyLoading,
    clearAll,
  };
}
