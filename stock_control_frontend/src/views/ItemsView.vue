<!-- ItemsView.vue -->
<template>
    <div class="items-view">
      <h1>Cadastro de itens</h1>
      <div class="items-filters">
        <h2>Filtros</h2>
        <ItemsFilters v-model="filters" @search="onSearch" />
      </div>
      <div class="items-list">
        <h2>Lista de itens</h2>
        <ItemsList :filters="filters" :refreshKey="refreshKey" />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import ItemsFilters from '@/components/ItemsFilters.vue'
  import ItemsList from '@/components/ItemsList.vue'
  
  interface ItemFilters {
    itemSKU: string
    itemDescription: string
    showOnlyActiveItems: boolean
  }
  
  const filters = ref<ItemFilters>({
    itemSKU: '',
    itemDescription: '',
    showOnlyActiveItems: false,
  })
  
  // chave reativa para forçar reload
  const refreshKey = ref(0)
  
  function onSearch() {
    // incrementa para disparar watcher em ItemsList
    refreshKey.value++
  }
  </script>
  