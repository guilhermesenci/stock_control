<!-- StockCostsFilters.vue -->
<template>
    <BaseFilterForm :fields="fields" v-model="filters" @search="onSearch" />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import type { FilterField } from '@/types/filter';
import BaseFilterForm from './BaseFilterForm.vue';

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

// Inicializa a data atual no carregamento do componente
onMounted(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    filters.value.stockDate = `${year}-${month}-${day}`;
});

// define os campos para esse formulário
const fields: FilterField<StockFilters>[] = [
    { key: 'stockDate', label: 'Estoque do dia:', type: 'date' },
    { key: 'itemSKU', label: 'SKU do produto:', type: 'text' },
    { key: 'itemDescription', label: 'Descrição do produto:', type: 'text' },
    { key: 'showOnlyStockItems', label: 'Exibir apenas itens com estoque', type: 'checkbox' },
    { key: 'showOnlyActiveItems', label: 'Exibir apenas itens ativos', type: 'checkbox' },
];

const emit = defineEmits<{
    (e: 'update:modelValue', value: StockFilters): void;
    (e: 'search'): void;
}>();

// dispara busca
function onSearch() {
    console.log('Buscar com filtros:', filters.value);
    emit('update:modelValue', { ...filters.value });
    emit('search');
}

// observa mudanças nos filtros e notifica o pai
watch(filters, (newValue) => {
    emit('update:modelValue', { ...newValue });
}, { deep: true });
</script>