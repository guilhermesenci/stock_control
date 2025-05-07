<template>
    <div>
      <BaseTable
        :columns="columns"
        :rows="table.data.value"
        :sortKey="table.sortKey.value"
        :sortOrder="table.sortOrder.value"
        keyField="sku"
        @update:sort="(key) => table.setSort(key as keyof ItemCost)"
      >
        <!-- Exemplo de custom render para quantidade zero -->
        <template #cell-quantity="{ value }">
          <span :class="{ 'text-muted': value === 0 }">
            {{ value }}
          </span>
        </template>
      </BaseTable>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import BaseTable from '@/components/BaseTable.vue';
  import { useTable } from '@/composables/useTable';
  import type { ColumnDef } from '@/composables/useTable';
  import { parseConsumptionTime } from '@/utils/time';

  
  interface ItemCost {
    sku: string;
    description: string;
    quantity: number;
    unityMeasure: string;
    unitCost: number;
    totalCost: number;
  }
  
  // dados mock (substitua por chamada ao serviço real)
  const items = ref<ItemCost[]>([
    { sku: '12345', description: 'Produto A', quantity: 10, unityMeasure: "PC", unitCost: 5.00, totalCost: 50.00 },
    { sku: '67890', description: 'Produto B', quantity: 5, unityMeasure: "PC", unitCost: 10.00, totalCost: 50.00 },
    { sku: '54321', description: 'Produto C', quantity: 0, unityMeasure: "PC", unitCost: 15.00, totalCost: 0.00 },
    /* ... demais itens ... */
  ]);
  
  // filtros vindos de ItemsFilters ou outro lugar
  const filters = ref({
    itemSKU: '',
    itemDescription: '',
    showOnlyStockItems: false,
  });
  
  // lista filtrada
  const filteredItems = computed(() =>
    items.value.filter(item => {
      const matchesSKU = item.sku.includes(filters.value.itemSKU);
      const matchesDescription = item.description.includes(filters.value.itemDescription);
      const matchesStock = !filters.value.showOnlyStockItems || item.quantity > 0;
      return matchesSKU && matchesDescription && matchesStock;
    })
  );
  
  // definindo colunas
  const columns: ColumnDef<ItemCost>[] = [
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'description', label: 'Descrição do Produto', sortable: true },
    { key: 'quantity', label: 'Quantidade em Estoque', sortable: true },
    { key: 'unityMeasure', label: 'Unidade de Medida', sortable: true },
    { key: 'unitCost', label: 'Custo Unitário', sortable: true },
    { key: 'totalCost', label: 'Custo Total', sortable: true },
  ];

  // inicializa composable de tabela com dados filtrados
  const table = useTable<ItemCost>(filteredItems, columns, {
    sku: filters.value.itemSKU,
    description: filters.value.itemDescription
});
  
  // reagir a mudanças de filtros
  watch(
    () => [filters.value.itemSKU, filters.value.itemDescription, filters.value.showOnlyStockItems],
    () => {
      table.setFilter('sku', filters.value.itemSKU);
      table.setFilter('description', filters.value.itemDescription);
      // Para o filtro de estoque, se ativo, você pode usar:
      table.setFilter('quantity', filters.value.showOnlyStockItems ? ((q: number) => q > 0).toString() : '');
    },
    { deep: true }
  );
  </script>
  