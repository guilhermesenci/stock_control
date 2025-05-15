<template>
    <BaseFilterForm
      :fields="fields"
      v-model="filters"
      @search="onSearch"
    />
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import type { FilterField } from '@/types/filter';
  import BaseFilterForm from './BaseFilterForm.vue';
  
  interface StockFilters {
    stockDate: string;
    itemSKU: string;
    itemDescription: string;
    showOnlyStockItems: boolean;
    showOnlyActiveItems: boolean;
  }
  
  const filters = ref<StockFilters>({
    stockDate: new Date().toISOString().split('T')[0],
    itemSKU: '',
    itemDescription: '',
    showOnlyStockItems: true,
    showOnlyActiveItems: true,
  });
  
  // Emitir evento para atualizar o componente pai
  const emit = defineEmits(['update:filters']);
  
  // inicializa a data com o dia atual
  onMounted(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    filters.value.stockDate = `${year}-${month}-${day}`;
    
    // Emite o evento com os filtros iniciais
    emit('update:filters', { ...filters.value });
  });
  
  // Observa mudanças nos filtros para emitir eventos
  watch(filters, (newFilters) => {
    emit('update:filters', { ...newFilters });
  }, { deep: true });
  
  // define os campos para esse formulário
  const fields: FilterField<StockFilters>[] = [
    { key: 'stockDate',             label: 'Estoque do dia:',                     type: 'date' },
    { key: 'itemSKU',               label: 'SKU do produto:',                     type: 'text'},
    { key: 'itemDescription',       label: 'Descrição do produto:',               type: 'text'},
    { key: 'showOnlyStockItems',    label: 'Exibir apenas itens com estoque',     type: 'checkbox'},
    { key: 'showOnlyActiveItems',   label: 'Exibir apenas itens ativos',          type: 'checkbox'},
  ];
  
  // dispara busca
  function onSearch(vals: Record<string, any>) {
    const filters = vals as StockFilters;
    console.log('Buscar com filtros:', vals);
    emit('update:filters', { ...vals });
  }
  </script>
  