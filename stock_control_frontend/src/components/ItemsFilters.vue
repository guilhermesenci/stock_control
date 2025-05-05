<!-- ItemsFilters.vue -->
<template>
    <BaseFilterForm
      :fields="fields"
      v-model="filters"
      @search="onSearch"
    />
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import BaseFilterForm from '@/components/BaseFilterForm.vue';
  import type { FilterField } from '@/types/filter';
  
  interface ItemFilters {
    itemSKU: string;
    itemDescription: string;
    showOnlyActiveItems: boolean;
  } 
  
  // estado dos filtros
  const filters = ref<ItemFilters>({
    itemSKU: '',
    itemDescription: '',
    showOnlyActiveItems: false,
  });

  interface StockFilters {
    itemSKU: string;
    itemDescription: string;
    showOnlyActiveItems: boolean;
  }
  
  // configurações dos campos de filtro
  const fields: FilterField<StockFilters>[] = [
    {
      key: 'itemSKU',
      label: 'SKU do produto:',
      type: 'text',
    },
    {
      key: 'itemDescription',
      label: 'Descrição do produto:',
      type: 'text',
    },
    {
      key: 'showOnlyActiveItems',
      label: 'Exibir apenas itens ativos?',
      type: 'checkbox'
    }
  ];
  
  // disparado ao clicar em “Pesquisar”
  function onSearch() {
    console.log('Filters:', filters.value);
    // aqui você aplica os filtros na tabela (via composable useTable)
  }
  </script>
  