<template>
    <div>
      <BaseTable
        :columns="columns"
        :rows="table.data.value"
        :sortKey="table.sortKey.value"
        :sortOrder="table.sortOrder.value"
        keyField="codSku"
        @update:sort="(key) => table.setSort(key as keyof Item)"
      >
        <!-- Exemplo de custom render para quantidade zero -->
        <template #cell-quantity="{ value }">
          <span :class="{ 'text-muted': value === 0 }">
            {{ value }}
          </span>
        </template>
      </BaseTable>
      <div v-if="loading">Carregando...</div>
      <div v-if="error" class="error-message">{{ error }}</div>
      <div class="pagination-controls" v-if="totalPages > 1">
        <button :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">Anterior</button>
        <span>Página {{ currentPage }} de {{ totalPages }}</span>
        <button :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">Próxima</button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue';
  import BaseTable from '@/components/BaseTable.vue';
  import { useTable } from '@/composables/useTable';
  import type { ColumnDef } from '@/composables/useTable';
  import { itemService, type Item } from '@/services/itemService';
  import { parseConsumptionTime } from '@/utils/time';

  const items = ref<Item[]>([]);
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
      const result = await itemService.getItems(page, {
        codSku: filters.value.itemSKU,
        descricaoItem: filters.value.itemDescription,
        // unidMedida: pode ser adicionado se houver filtro
      });
      items.value = result.items;
      totalItems.value = result.total;
      currentPage.value = page;
    } catch (e) {
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

  onMounted(() => fetchItems(1));

  // filtros vindos de ItemsFilters ou outro lugar
  const filters = ref({
    itemSKU: '',
    itemDescription: '',
    showOnlyStockItems: false,
  });

  // Sempre busca da API quando filtros mudam
  watch(
    () => [filters.value.itemSKU, filters.value.itemDescription],
    () => fetchItems(1),
    { deep: true }
  );

  // definindo colunas
  const columns: ColumnDef<Item>[] = [
    { key: 'codSku', label: 'SKU', sortable: true },
    { key: 'descricaoItem', label: 'Descrição do Produto', sortable: true },
    { key: 'unidMedida', label: 'Unidade de Medida', sortable: true },
    // Adicione outras colunas conforme necessário
  ];

  // inicializa composable de tabela com dados
  const table = useTable<Item>(items, columns, {
    codSku: filters.value.itemSKU,
    descricaoItem: filters.value.itemDescription
  });
  </script>
  