<template>
    <div>
      <BaseTable
        :columns="columns"
        :rows="table.data.value"
        :sortKey="table.sortKey.value"
        :sortOrder="table.sortOrder.value"
        keyField="sku"
        @update:sort="(key) => table.setSort(key as keyof StockCost)"
      >
        <!-- Formatação para quantidade zero -->
        <template #cell-quantity="{ value }">
          <span :class="{ 'text-muted': value === 0 }">
            {{ value }}
          </span>
        </template>
        
        <!-- Formatação para valor unitário -->
        <template #cell-unitCost="{ value }">
          {{ formatCurrency(value) }}
        </template>
        
        <!-- Formatação para valor total -->
        <template #cell-totalCost="{ value }">
          {{ formatCurrency(value) }}
        </template>
      </BaseTable>
      <div v-if="loading" class="loading">Carregando custos de estoque...</div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue';
  import BaseTable from '@/components/BaseTable.vue';
  import { useTable } from '@/composables/useTable';
  import type { ColumnDef } from '@/composables/useTable';
  import { stockCostService, type StockCost } from '@/services/stockCostService';
  
  const props = defineProps<{
    filters: {
      stockDate: string;
      itemSKU: string;
      itemDescription: string;
      showOnlyStockItems: boolean;
      showOnlyActiveItems: boolean;
    }
    refreshKey?: number
  }>();
  
  const loading = ref(false);
  const items = ref<StockCost[]>([]);
  
  // formatador de moeda
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
  
  // definindo colunas
  const columns: ColumnDef<StockCost>[] = [
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'description', label: 'Descrição do Produto', sortable: true },
    { key: 'quantity', label: 'Quantidade em Estoque', sortable: true },
    { key: 'unityMeasure', label: 'Unidade de Medida', sortable: true },
    { key: 'unitCost', label: 'Custo Unitário', sortable: true },
    { key: 'totalCost', label: 'Custo Total', sortable: true },
  ];

  // inicializa composable de tabela com dados
  const table = useTable<StockCost>(items, columns);
  
  // busca os custos de estoque da API
  async function fetchStockCosts() {
    try {
      loading.value = true;
      
      // Mapeia os filtros para o formato esperado pelo serviço
      const serviceFilters: Record<string, any> = {};
      
      if (props.filters.itemSKU) {
        serviceFilters.sku = props.filters.itemSKU;
      }
      
      if (props.filters.itemDescription) {
        serviceFilters.description = props.filters.itemDescription;
      }
      
      if (props.filters.showOnlyStockItems) {
        serviceFilters.hasStock = true;
      }
      
      if (props.filters.showOnlyActiveItems) {
        serviceFilters.active = true;
      }
      
      const result = await stockCostService.getStockCosts(
        props.filters.stockDate,
        serviceFilters
      );
      
      items.value = result.results;
    } catch (error) {
      console.error('Erro ao buscar custos de estoque:', error);
    } finally {
      loading.value = false;
    }
  }
  
  // busca inicial
  onMounted(() => {
    fetchStockCosts();
  });
  
  // reagir a mudanças de filtros ou refreshKey
  watch(
    [() => props.filters, () => props.refreshKey],
    () => {
      fetchStockCosts();
    },
    { deep: true }
  );
  </script>
  
  <style scoped>
  .loading {
    padding: 1rem;
    text-align: center;
    color: #666;
  }
  .text-muted {
    color: #999;
  }
  </style>
  