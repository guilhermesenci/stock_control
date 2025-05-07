<!-- TransactionsFilters.vue -->
<template>
    <BaseFilterForm :fields="fields" v-model="filters" @search="onSearch" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FilterField } from '@/types/filter'
import BaseFilterForm from './BaseFilterForm.vue'

interface TransactionFilters {
    transactionsDateFrom: string
    transactionsDateTo: string
    itemSKU: string
    itemDescription: string
}

const filters = ref<TransactionFilters>({
    transactionsDateFrom: '',
    transactionsDateTo: '',
    itemSKU: '',
    itemDescription: ''
})

const fields: FilterField<TransactionFilters>[] = [
    { key: 'transactionsDateFrom', label: 'Data inicial:', type: 'date' },
    { key: 'transactionsDateTo', label: 'Data final:', type: 'date' },
    { key: 'itemSKU', label: 'SKU do produto:', type: 'text' },
    { key: 'itemDescription', label: 'Descrição do produto:', type: 'text' }
]

// dispara busca
function onSearch(vals: Record<string, any>) {
    const f = vals as TransactionFilters
    console.log('Buscar transações com filtros:', f)
    // aqui você chama o serviço, composable ou atualiza a tabela
}
</script>
