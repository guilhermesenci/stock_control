<!-- ItemsFilters.vue -->
<template>
    <BaseFilterForm
      :fields="fields"
      v-model="filters"
      @search="onSearch"
    />
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue';
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
    showOnlyActiveItems: true,
  });

  interface StockFilters {
    itemSKU: string;
    itemDescription: string;
    showOnlyActiveItems: boolean;
  }
  
  // configurações dos campos de filtro
  const fields: FilterField<ItemFilters>[] = [
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
  
  // disparado ao clicar em "Pesquisar"
  function onSearch() {
    console.log('ItemsFilters: Botão de pesquisa clicado');
    console.log('ItemsFilters: Filtros atuais:', filters.value);
    // Primeiro atualiza o modelo
    emit('update:modelValue', { ...filters.value });
    // Depois dispara o evento de busca
    emit('search');
  }

  // emite eventos para o componente pai
  const emit = defineEmits<{
    (e: 'update:modelValue', value: ItemFilters): void;
    (e: 'search'): void;
  }>();

  // observa mudanças nos filtros e notifica o pai
  watch(filters, (newValue) => {
    console.log('ItemsFilters: Filtros atualizados:', newValue);
    emit('update:modelValue', { ...newValue });
  }, { deep: true });
  </script>
  