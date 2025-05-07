<template>
    <div class="stock-costs-view">
        <h1>Custos do estoque</h1>
        <div class="stock-costs-filters">
            <h2>Filtros</h2>
            <StockCostsFilters />
        </div>
        <div class="stock-costs-list">
        <h2>Lista de Produtos</h2>
            <StockCostsList />
        </div>
    </div>
</template>
<script setup lang="ts">
import StockCostsFilters from '@/components/StockCostsFilters.vue';
import StockCostsList from '@/components/StockCostsList.vue';
</script>

<style scoped>
.stock-costs-view {
    padding: 16px;
}

.stock-costs-filters {
    margin-left: auto;
    margin-right: auto;
    max-width: 100%;
    padding: 16px;
    box-sizing: border-box;
}
</style>