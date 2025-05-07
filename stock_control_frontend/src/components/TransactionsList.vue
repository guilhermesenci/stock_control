<!-- TransactionsList.vue -->
<template>
    <BaseTable :columns="columns" :rows="table.data.value" :sortKey="table.sortKey.value"
        :sortOrder="table.sortOrder.value" keyField="cronology"
        @update:sort="(key) => table.setSort(key as keyof Transaction)" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseTable from './BaseTable.vue';
import type { ColumnDef } from '@/composables/useTable';
import { parseBrazilianDate } from '@/utils/date';
import { useTable } from '@/composables/useTable';

interface Transaction {
    cronology: number;
    date: string;
    sku: string;
    description: string;
    quantity: number;
    unityMeasure: string;
    cost: number;
}

// dados
const transactions = ref<Transaction[]>([
    {
        cronology: 1,
        date: '01/10/2023',
        sku: 'SKU123',
        description: 'Produto A',
        quantity: 10,
        unityMeasure: 'unidade',
        cost: 100.0
    },
    {
        cronology: 2,
        date: '02/10/2023',
        sku: 'SKU456',
        description: 'Produto B',
        quantity: 5,
        unityMeasure: 'unidade',
        cost: 50.0
    },
    {
        cronology: 3,
        date: '03/10/2023',
        sku: 'SKU789',
        description: 'Produto C',
        quantity: 20,
        unityMeasure: 'unidade',
        cost: 200.0
    },
    {
        cronology: 4,
        date: '04/10/2023',
        sku: 'SKU101',
        description: 'Produto D',
        quantity: 15,
        unityMeasure: 'unidade',
        cost: 150.0
    },
    {
        cronology: 5,
        date: '05/10/2023',
        sku: 'SKU112',
        description: 'Produto E',
        quantity: 8,
        unityMeasure: 'unidade',
        cost: 80.0
    },
    {
        cronology: 6,
        date: '06/10/2023',
        sku: 'SKU131',
        description: 'Produto F',
        quantity: 12,
        unityMeasure: 'unidade',
        cost: 120.0
    },
    {
        cronology: 7,
        date: '07/10/2023',
        sku: 'SKU415',
        description: 'Produto G',
        quantity: 7,
        unityMeasure: 'unidade',
        cost: 70.0
    },
    {
        cronology: 8,
        date: '08/10/2023',
        sku: 'SKU161',
        description: 'Produto H',
        quantity: 25,
        unityMeasure: 'unidade',
        cost: 250.0
    }
]);

// filtros (se você for usar filtragem interna)
const filters = ref({
    itemSKU: '',
    itemDescription: '',
    transactionsDateFrom: '',
    transactionsDateTo: '',
});

// estado de ordenação
const sortKey = ref<keyof Transaction | null>(null);
const sortOrder = ref<'asc' | 'desc'>('asc');

// callback de clique no header
function onSort(key: keyof Transaction) {
    if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortKey.value = key;
        sortOrder.value = 'asc';
    }
}

// colunas com sortFn onde necessário
const columns: ColumnDef<Transaction>[] = [
    { key: 'cronology', label: 'Cronologia', sortable: true },
    {
        key: 'date',
        label: 'Data',
        sortable: true,
        sortFn: (a, b, order) => {
            const timeA = parseBrazilianDate(a.date);
            const timeB = parseBrazilianDate(b.date);
            return order === 'asc' ? timeA - timeB : timeB - timeA;
        }
    },
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'description', label: 'Descrição', sortable: true },
    { key: 'quantity', label: 'Quantidade', sortable: true },
    { key: 'unityMeasure', label: 'Unidade de Medida' },
    { key: 'cost', label: 'Custo da transação', sortable: true }
];
const table = useTable<Transaction>(transactions, columns, {
    // se usar filtros, pode passar initialFilters aqui
});

</script>