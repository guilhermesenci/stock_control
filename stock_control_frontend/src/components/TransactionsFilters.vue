<!-- TransactionsFilters.vue -->
<template>
    <BaseFilterForm :fields="fields" :modelValue="filters" @update:modelValue="value => filters = value" @search="onSearch">
      <template #default="{ filters }">
        <div class="date-range">
          <FilterInput id="transactions-date-from" label="De:" type="date" v-model="filters.transactionsDateFrom" />
          <FilterInput id="transactions-date-to" label="Até:" type="date" v-model="filters.transactionsDateTo" />
        </div>
        <FilterInput id="item-sku" label="SKU do produto:" type="text" v-model="filters.itemSKU" />
        <FilterInput id="item-description" label="Descrição do produto:" type="text" v-model="filters.itemDescription" />
      </template>
    </BaseFilterForm>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import FilterInput from './FilterInput.vue';
  import BaseFilterForm from './BaseFilterForm.vue';
  
  const filters = ref({
    transactionsDateFrom: '',
    transactionsDateTo: '',
    itemSKU: '',
    itemDescription: ''
  });

  const fields = [
      { key: 'transactionsDateFrom', name: 'transactionsDateFrom', label: 'De:', type: 'text' as const },
      { key: 'transactionsDateTo', name: 'transactionsDateTo', label: 'Até:', type: 'text' as const },
      { key: 'itemSKU', name: 'itemSKU', label: 'SKU do produto:', type: 'text' as const },
      { key: 'itemDescription', name: 'itemDescription', label: 'Descrição do produto:', type: 'text' as const }
    ];
  
  function onSearch() {
    console.log('Filters:', filters.value);
  }
  </script>
  
  <style scoped>
  .date-range {
    display: flex;
    gap: 20px;
  }
  </style>
  