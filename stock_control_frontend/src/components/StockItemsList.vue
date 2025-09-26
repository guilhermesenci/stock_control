<template>
    <div>
      <BaseTable
        :columns="columns"
        :rows="items"
        :sortKey="sortKey"
        :sortOrder="sortOrder"
        keyField="codSku"
        @update:sort="handleSort"
      >
        <!-- Exemplo de custom render para quantidade zero -->
        <template #cell-quantity="{ value }">
          <span :class="{ 'text-muted': value === 0 }">
            {{ formatDecimal(value) }}
          </span>
        </template>

        <!-- Formatação do tempo estimado de consumo -->
        <template #cell-estimatedConsumptionTime="{ value }">
          <span>{{ formatConsumptionTime(value) }}</span>
        </template>
      </BaseTable>
      <div v-if="loading" class="loading">Carregando estoques...</div>
      
      <div v-if="error" class="error-message">{{ error }}</div>
      
      <PaginationControls
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-items="totalItems"
        :page-size="pageSize"
        @go-to-page="goToPage"
        @change-page-size="changePageSize"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch, onMounted, defineProps } from 'vue';
  import BaseTable from '@/components/BaseTable.vue';
  import PaginationControls from '@/components/PaginationControls.vue';
  import { usePagination } from '@/composables/usePagination';
  import type { ColumnDef } from '@/composables/useTable';
  import { stockService, type StockItem } from '@/services/stockService';
  import { parseConsumptionTime } from '@/utils/time';
  import { formatDecimal } from '@/utils/numbersFormat';
  // Recebe os filtros do componente pai
  const props = defineProps<{
    filters: {
      stockDate: string;
      itemSKU: string;
      itemDescription: string;
      showOnlyStockItems: boolean;
      showOnlyActiveItems: boolean;
    }
  }>();

  const items = ref<StockItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Usar o novo composable de paginação
  const pagination = usePagination({
    pageSize: 10,
    initialPage: 1,
    initialSort: { key: 'codSku', order: 'asc' }
  });

  // Busca itens da API com filtros, paginação e ordenação
  async function fetchItems() {
    loading.value = true;
    error.value = null;
    try {
      console.log('StockItemsList: Buscando itens com filtros:', props.filters);
      console.log('StockItemsList: Estado da paginação:', pagination.paginationState.value);
      console.log('StockItemsList: Estado da ordenação:', pagination.sortState.value);
      
      // Preparar parâmetros de query
      const queryParams = {
        ...pagination.getQueryParams(),
        codSku: props.filters.itemSKU,
        descricaoItem: props.filters.itemDescription,
        stockDate: props.filters.stockDate,
        showOnlyStockItems: props.filters.showOnlyStockItems,
        showOnlyActiveItems: props.filters.showOnlyActiveItems,
      };
      
      const result = await stockService.getStockItems(
        parseInt(queryParams.page), 
        queryParams
      );
      
      items.value = result.results;
      pagination.updateTotalItems(result.count);
    } catch (e) {
      console.error('Erro ao carregar itens:', e);
      error.value = 'Erro ao carregar itens';
    } finally {
      loading.value = false;
    }
  }

  // Função para mudar de página
  function goToPage(page: number) {
    pagination.goToPage(page);
  }

  // Função para mudar tamanho da página
  function changePageSize(size: number) {
    pagination.updatePageSize(size);
  }

  // Função para ordenar
  function handleSort(key: string) {
    pagination.setSort(key);
  }

  // Formata o tempo estimado de consumo para exibição amigável
  function formatConsumptionTime(time: string | null): string {
    return parseConsumptionTime(time);
  }

  onMounted(() => {
    console.log('StockItemsList: Component mounted');
    // Não precisa buscar aqui, o watch nos props.filters já vai disparar a busca
  });

  // Busca dados quando os filtros mudam
  watch(() => props.filters, (newFilters) => {
    console.log('StockItemsList: Filtros mudaram:', newFilters);
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

  // definindo colunas
  const columns: ColumnDef<StockItem>[] = [
    { key: 'codSku', label: 'SKU', sortable: true },
    { key: 'descricaoItem', label: 'Descrição do Produto', sortable: true },
    { key: 'unidMedida', label: 'Unidade de Medida', sortable: true },
    { key: 'quantity', label: 'Quantidade em Estoque', sortable: true },
    { key: 'estimatedConsumptionTime', label: 'Tempo Estimado de Consumo', sortable: false },
    // Adicione outras colunas conforme necessário
  ];

  // Expor dados para o template
  const currentPage = computed(() => pagination.currentPage.value);
  const totalPages = computed(() => pagination.totalPages.value);
  const totalItems = computed(() => pagination.totalItems.value);
  const pageSize = computed(() => pagination.pageSize.value);
  const sortKey = computed(() => pagination.sortKey.value);
  const sortOrder = computed(() => pagination.sortOrder.value);
  </script>
  