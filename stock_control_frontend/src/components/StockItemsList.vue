<template>
    <div>
      <BaseTable
        :columns="columns"
        :rows="table.data.value"
        :sortKey="table.sortKey.value"
        :sortOrder="table.sortOrder.value"
        keyField="codSku"
        @update:sort="(key) => table.setSort(key as keyof StockItem)"
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
      <div class="pagination-controls" v-if="totalPages > 1">
        <button :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">Anterior</button>
        <span>Página {{ currentPage }} de {{ totalPages }}</span>
        <button :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">Próxima</button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch, onMounted, defineProps } from 'vue';
  import BaseTable from '@/components/BaseTable.vue';
  import { useTable } from '@/composables/useTable';
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
  const currentPage = ref(1);
  const totalItems = ref(0);
  const pageSize = 10; // ou o valor padrão da sua API
  const totalPages = computed(() => Math.ceil(totalItems.value / pageSize));

  // Busca itens da API com filtros e paginação
  async function fetchItems(page = currentPage.value) {
    loading.value = true;
    error.value = null;
    try {
      console.log('StockItemsList: Buscando itens com filtros:', props.filters);
      const result = await stockService.getStockItems(page, {
        codSku: props.filters.itemSKU,
        descricaoItem: props.filters.itemDescription,
        stockDate: props.filters.stockDate,
        showOnlyStockItems: props.filters.showOnlyStockItems,
        showOnlyActiveItems: props.filters.showOnlyActiveItems,
      });
      items.value = result.results;
      totalItems.value = result.total;
      currentPage.value = page;
    } catch (e) {
      console.error('Erro ao carregar itens:', e);
      error.value = 'Erro ao carregar itens';
    } finally {
      loading.value = false;
    }
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      fetchItems(page);
    }
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
    fetchItems(1);
  }, { deep: true });

  // definindo colunas
  const columns: ColumnDef<StockItem>[] = [
    { key: 'codSku', label: 'SKU', sortable: true },
    { key: 'descricaoItem', label: 'Descrição do Produto', sortable: true },
    { key: 'unidMedida', label: 'Unidade de Medida', sortable: true },
    { key: 'quantity', label: 'Quantidade em Estoque', sortable: true },
    { key: 'estimatedConsumptionTime', label: 'Tempo Estimado de Consumo', sortable: false },
    // Adicione outras colunas conforme necessário
  ];

  // inicializa composable de tabela com dados
  const table = useTable<StockItem>(items, columns);
  </script>
  