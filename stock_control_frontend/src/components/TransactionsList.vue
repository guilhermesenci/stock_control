<!-- TransactionsList.vue -->
<template>
    <div class="transactions-table">
        <div v-if="loading" class="loading-container">
            <p>Carregando transações...</p>
        </div>
        <div v-else-if="error" class="error-container">
            <p>Erro ao carregar transações: {{ error }}</p>
        </div>
        <div v-else-if="transactions.length === 0" class="empty-state">
            <p>Nenhuma transação encontrada.</p>
        </div>
        <BaseTable 
            v-else
            :columns="columns" 
            :rows="table.data.value" 
            :sortKey="table.sortKey.value"
            :sortOrder="table.sortOrder.value" 
            keyField="id"
            @update:sort="(key) => table.setSort(key as keyof Transaction)" 
        >
            <template #cell-transactionType="{ value }">
                <span :class="['badge', value === 'Entrada' ? 'entrada' : 'saida']">
                    {{ value }}
                </span>
            </template>
            <template #cell-edit="{ row }">
                <button class="btn-edit" @click="onEdit(row)">
                    Editar
                </button>
            </template>
            <template #cell-delete="{ row }">
                <button class="btn-delete" @click="onDelete(row)">
                    Deletar
                </button>
            </template>
        </BaseTable>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import BaseTable from './BaseTable.vue';
import type { ColumnDef } from '@/composables/useTable';
import { parseBrazilianDate, formatDateToBrazilian } from '@/utils/date';
import { useTable } from '@/composables/useTable';
import { transactionService, type FormattedTransaction, type TransactionSearchParams } from '@/services/transactionService';

// Extended column definition with formatter and html
interface ExtendedColumnDef<T> extends ColumnDef<T> {
  formatter?: (value: any, row?: any) => string;
  html?: boolean;
}

// Interface for table
interface Transaction {
    id: string;
    cronology: number;
    date: string;
    time: string;
    sku: string;
    description: string;
    quantity: number;
    unityMeasure: string;
    cost: number;
    transactionType: string;
    notaFiscal?: string; // Optional - only for entries
    username: string;
    edit: string; // Placeholder for edit button column
    delete: string; // Placeholder for delete button column
}

// Interface for raw filters from parent component
interface TransactionFilters {
  transactionsDateFrom: string;
  transactionsDateTo: string;
  itemSKU: string;
  itemDescription: string;
  notaFiscal: string;
}

// Props to receive filters from parent component
const props = defineProps<{
    filters?: TransactionFilters
    refreshKey?: number
}>();

// Convert from parent filters to service params format
const serviceParams = computed<TransactionSearchParams>(() => {
    if (!props.filters) return {};
    
    const params = {
        dateFrom: props.filters.transactionsDateFrom || undefined,
        dateTo: props.filters.transactionsDateTo || undefined,
        sku: props.filters.itemSKU === '' ? undefined : props.filters.itemSKU,
        description: props.filters.itemDescription === '' ? undefined : props.filters.itemDescription,
        notaFiscal: props.filters.notaFiscal === '' ? undefined : props.filters.notaFiscal
    };
    
    console.log('TransactionsList: Computed serviceParams:', params);
    return params;
});

// Emit events to parent
const emit = defineEmits<{
    (e: 'edit', transaction: Transaction): void
    (e: 'delete', transaction: Transaction): void
}>();

// State
const transactions = ref<Transaction[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Load transactions with filters
async function fetchTransactions() {
    console.log('TransactionsList: fetchTransactions called');
    console.log('TransactionsList: Raw filters:', props.filters);
    console.log('TransactionsList: Converted params:', serviceParams.value);
    
    loading.value = true;
    error.value = null;
    
    try {
        console.log('TransactionsList: Calling API with params:', JSON.stringify(serviceParams.value));
        
        // Use converted params for the API call
        const result = await transactionService.getTransactions(serviceParams.value);
        
        console.log('TransactionsList: API call result:', result);
        
        // Convert from FormattedTransaction to table format
        transactions.value = result.map((item, index) => ({
            id: item.id,
            cronology: item.idTransacao,
            date: formatDateToBrazilian(item.date),
            time: item.time,
            sku: item.sku,
            description: item.description,
            quantity: item.quantity,
            unityMeasure: item.unityMeasure,
            cost: item.totalCost,
            transactionType: item.transactionType === 'entrada' ? 'Entrada' : 'Saída',
            notaFiscal: item.notaFiscal,
            username: item.username || 'N/A',
            edit: '', // Placeholder for edit button
            delete: '', // Placeholder for delete button
        }));
    } catch (err) {
        console.error('Erro ao carregar transações:', err);
        error.value = 'Não foi possível carregar as transações. Tente novamente mais tarde.';
        transactions.value = [];
    } finally {
        loading.value = false;
    }
}

// Load initial data when component is mounted
onMounted(() => {
    console.log('TransactionsList: Component mounted');
    fetchTransactions();
});

// Reload when filters or refreshKey change
watch([() => props.filters, () => props.refreshKey], ([newFilters, newRefreshKey], [oldFilters, oldRefreshKey]) => {
    console.log('TransactionsList: Watch triggered');
    console.log('TransactionsList: New filters:', newFilters);
    console.log('TransactionsList: Old filters:', oldFilters);
    console.log('TransactionsList: New refreshKey:', newRefreshKey);
    console.log('TransactionsList: Old refreshKey:', oldRefreshKey);
    
    // Check if filters have changed
    if (JSON.stringify(newFilters) !== JSON.stringify(oldFilters)) {
        console.log('TransactionsList: Filters have changed, fetching new data');
        fetchTransactions();
    }
    // Check if refreshKey has changed
    else if (newRefreshKey !== oldRefreshKey) {
        console.log('TransactionsList: RefreshKey has changed, fetching new data');
        fetchTransactions();
    }
    else {
        console.log('TransactionsList: No significant changes detected');
    }
}, { deep: true });

// Table columns
const columns: ExtendedColumnDef<Transaction>[] = [
    { key: 'cronology', label: 'Cronologia', sortable: true },
    { 
        key: 'transactionType', 
        label: 'Tipo', 
        sortable: true,
        html: true
    },
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
    {
        key: 'time',
        label: 'Hora',
        sortable: true
    },
    { 
        key: 'notaFiscal', 
        label: 'Número NF',
        sortable: true,
        formatter: (value: string) => value || '-' 
    },
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'description', label: 'Descrição', sortable: true },
    { 
        key: 'quantity', 
        label: 'Quantidade', 
        sortable: true,
        formatter: (value: number, row: Transaction) => `${value} ${row.unityMeasure}`
    },
    { 
        key: 'cost', 
        label: 'Custo da transação', 
        sortable: true,
        formatter: (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`
    },
    { key: 'username', label: 'Usuário', sortable: true },
    { key: 'edit', label: 'Editar', sortable: false },
    { key: 'delete', label: 'Deletar', sortable: false }
];

// Use the useTable to manage sorting
const table = useTable<Transaction>(transactions, columns as ColumnDef<Transaction>[]);

// Functions for edit and delete buttons
function onEdit(transaction: Transaction) {
    emit('edit', transaction);
}

function onDelete(transaction: Transaction) {
    emit('delete', transaction);
}
</script>

<style scoped>
.transactions-table {
    width: 100%;
    min-height: 200px;
}

.loading-container, .error-container, .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    border: 1px solid #eee;
    border-radius: 4px;
}

.error-container {
    color: #dc3545;
}

.badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
}

.badge.entrada {
    background-color: #28a745;
    color: white;
}

.badge.saida {
    background-color: #dc3545;
    color: white;
}

.btn-edit {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    border: 1px solid #007bff;
    background: white;
    color: #007bff;
    border-radius: 4px;
    cursor: pointer;
}

.btn-edit:hover {
    background: #007bff;
    color: white;
}

.btn-delete {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    border: 1px solid #dc3545;
    background: white;
    color: #dc3545;
    border-radius: 4px;
    cursor: pointer;
}

.btn-delete:hover {
    background: #dc3545;
    color: white;
}
</style>