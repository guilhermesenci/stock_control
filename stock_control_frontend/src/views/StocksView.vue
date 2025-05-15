<template>
    <div class="stocks-view view">
        <h1>Estoque</h1>
        <div class="stock-filters">
            <h2>Filtros</h2>
            <StocksFilters @update:filters="updateFilters" />
        </div>
        <div class="stock-list list-container">
        <h2>Lista de Produtos</h2>
            <StockItemsList :filters="stockFilters" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import StocksFilters from '@/components/StocksFilters.vue';
import StockItemsList from '@/components/StockItemsList.vue';

// Define o estado dos filtros compartilhados
const stockFilters = ref({
    stockDate: '',
    itemSKU: '',
    itemDescription: '',
    showOnlyStockItems: true,
    showOnlyActiveItems: true,
});

// Atualiza os filtros quando o componente filho emite o evento
function updateFilters(newFilters: typeof stockFilters.value) {
    stockFilters.value = { ...newFilters };
}
</script>
