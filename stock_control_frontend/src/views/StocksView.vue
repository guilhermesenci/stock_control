<template>
    <div class="stocks-view">
        <h1>Estoque</h1>
        <div class="stock-filters">
            <h2>Filtros</h2>
            <StocksFilters @update:filters="updateFilters" />
        </div>
        <div class="stock-list">
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
    showOnlyStockItems: false,
    showOnlyActiveItems: false,
});

// Atualiza os filtros quando o componente filho emite o evento
function updateFilters(newFilters: typeof stockFilters.value) {
    stockFilters.value = { ...newFilters };
}
</script>

<style scoped>
.stocks-view {
    padding: 16px;
}

.stock-filters {
    margin-left: auto;
    margin-right: auto;
    max-width: 100%;
    padding: 16px;
    box-sizing: border-box;
}
</style>