<template>
    <div class="search-transactions-view">
        <h1>Consultar transações</h1>
        <div class="transactions-filters">
            <h2>Filtros</h2>
            <TransactionsFilters />
        </div>
        <div class="transactions-list">
        <h2>Lista de transações</h2>
            <TransactionsList />
        </div>
    </div>
</template>
<script setup lang="ts">
import TransactionsFilters from '@/components/TransactionsFilters.vue';
import TransactionsList from '@/components/TransactionsList.vue';
</script>

<style scoped>
.search-transactions-view {
    padding: 16px;
}

.transactions-filters {
    margin-left: auto;
    margin-right: auto;
    max-width: 100%;
    padding: 16px;
    box-sizing: border-box;
}
</style>