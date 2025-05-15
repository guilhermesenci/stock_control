<template>
    <div class="stock-costs-view view">
        <h1>Custos do estoque</h1>
        <div class="stock-costs-filters">
            <h2>Filtros</h2>
            <StockCostsFilters v-model="filters" @search="onSearch" />
        </div>
        <div class="stock-costs-list list-container">
        <h2>Lista de Produtos</h2>
            <StockCostsList :filters="filters" :refreshKey="refreshKey" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import StockCostsFilters from '@/components/StockCostsFilters.vue';
import StockCostsList from '@/components/StockCostsList.vue';

interface StockFilters {
    stockDate: string;
    itemSKU: string;
    itemDescription: string;
    showOnlyStockItems: boolean;
    showOnlyActiveItems: boolean;
}

const filters = ref<StockFilters>({
    stockDate: '',
    itemSKU: '',
    itemDescription: '',
    showOnlyStockItems: false,
    showOnlyActiveItems: true,
});

// chave reativa para forçar reload da lista
const refreshKey = ref(0);

// função para atualizar a lista quando os filtros forem aplicados
function onSearch() {
    console.log('StockCostsView: Aplicando filtros:', filters.value);
    refreshKey.value++;
}
</script>
