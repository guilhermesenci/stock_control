<!-- ItemsView.vue -->

<template>
    <div class="items-view">
        <h1>Cadastro de itens</h1>
        <div class="items-filters">
            <h2>Filtros</h2>
            <ItemsFilters v-model="filters"/>
        </div>
        <div class="items-list">
        <h2>Lista de itens</h2>
            <ItemsList :filters="filters"/>
        </div>
    </div>
</template>
<script setup lang="ts">
import ItemsFilters from '@/components/ItemsFilters.vue';
import ItemsList from '@/components/ItemsList.vue';
import { ref } from 'vue';

const filters = ref({
  itemSKU: '',
  itemDescription: '',
  showOnlyActiveItems: false,
});
</script>

<style scoped>
.items-view {
    padding: 16px;
}

.items-filters {
    margin-left: auto;
    margin-right: auto;
    max-width: 100%;
    padding: 16px;
    box-sizing: border-box;
}
</style>