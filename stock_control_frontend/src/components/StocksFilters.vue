<template>
    <BaseFilterForm
      :fields="fields"
      v-model="filters"
      @search="onSearch"
    />
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import type { FilterField } from '@/types/filter';
  import BaseFilterForm from './BaseFilterForm.vue';
  
  interface StockFilters {
    stockDate: string;
    itemSKU: string;
    itemDescription: string;
    showOnlyStockItems: boolean;
  }
  
  const filters = ref<StockFilters>({
    stockDate: '',
    itemSKU: '',
    itemDescription: '',
    showOnlyStockItems: false,
  });
  
  // define os campos para esse formulário
  const fields: FilterField<StockFilters>[] = [
    { key: 'stockDate',             label: 'Estoque do dia:',                     type: 'date' },
    { key: 'itemSKU',               label: 'SKU do produto:',                     type: 'text'},
    { key: 'itemDescription',       label: 'Descrição do produto:',               type: 'text'},
    { key: 'showOnlyStockItems',    label: 'Exibir apenas itens com estoque',     type: 'checkbox'},
  ];
  
  // dispara busca
  function onSearch(vals: Record<string, any>) {
    const filters = vals as StockFilters;
    console.log('Buscar com filtros:', vals);
    // aqui você chama o serviço, composable ou atualiza a tabela
  }
  </script>
  