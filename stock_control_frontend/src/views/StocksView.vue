<template>
    <div class="stocks-view">
        <h1>Estoque</h1>
        <div class="stock-filters">
            <h2>Filtros</h2>
            <StocksFilters />
        </div>
        <div class="stock-list">
        <h2>Lista de Produtos</h2>
            <StockItemsList />
        </div>
    </div>
</template>
<script setup lang="ts">
import StocksFilters from '@/components/StocksFilters.vue';
import StockItemsList from '@/components/StockItemsList.vue';
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