<!-- SuppliersFilters.vue -->
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
  
  interface SupplierFilters {
    supplierName: string;
    showOnlyActive: boolean;
  } 
  
  // estado dos filtros
  const filters = ref<SupplierFilters>({
    supplierName: '',
    showOnlyActive: true,
  });
  
  // configurações dos campos de filtro
  const fields: FilterField<SupplierFilters>[] = [
    {
      key: 'supplierName',
      label: 'Nome do fornecedor:',
      type: 'text',
    },
    {
      key: 'showOnlyActive',
      label: 'Exibir apenas fornecedores ativos?',
      type: 'checkbox'
    }
  ];
  
  // disparado ao clicar em "Pesquisar"
  function onSearch() {
    console.log('SuppliersFilters: Botão de pesquisa clicado');
    console.log('SuppliersFilters: Filtros atuais:', filters.value);
    // Primeiro atualiza o modelo
    emit('update:modelValue', { ...filters.value });
    // Depois dispara o evento de busca
    emit('search');
  }

  // emite eventos para o componente pai
  const emit = defineEmits<{
    (e: 'update:modelValue', value: SupplierFilters): void;
    (e: 'search'): void;
  }>();

  // observa mudanças nos filtros e notifica o pai
  watch(filters, (newValue) => {
    console.log('SuppliersFilters: Filtros atualizados:', newValue);
    emit('update:modelValue', { ...newValue });
  }, { deep: true });
  </script> 