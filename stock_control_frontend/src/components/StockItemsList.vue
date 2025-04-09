<template>
    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th>SKU</th>
                    <th>Descrição do Produto</th>
                    <th>Quantidade em Estoque</th>
                    <th>Tempo Estimado de Consumo do Estoque</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in filteredItems" :key="item.sku">
                    <td>{{ item.sku }}</td>
                    <td>{{ item.description }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ item.estimatedConsumptionTime }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const items = ref([
    { sku: '12345', description: 'Produto A', quantity: 10, estimatedConsumptionTime: '2 semanas' },
    { sku: '67890', description: 'Produto B', quantity: 5, estimatedConsumptionTime: '1 mês' },
    { sku: '54321', description: 'Produto C', quantity: 0, estimatedConsumptionTime: '3 semanas' },
    { sku: '09876', description: 'Produto D', quantity: 20, estimatedConsumptionTime: '1 semana' },
    { sku: '11223', description: 'Produto E', quantity: 15, estimatedConsumptionTime: '2 meses' },
    { sku: '44556', description: 'Produto F', quantity: 0, estimatedConsumptionTime: '1 mês' },
    { sku: '77889', description: 'Produto G', quantity: 8, estimatedConsumptionTime: '3 semanas' },
    { sku: '99000', description: 'Produto H', quantity: 12, estimatedConsumptionTime: '2 semanas' },
    { sku: '12321', description: 'Produto I', quantity: 0, estimatedConsumptionTime: '1 mês' },
    { sku: '45654', description: 'Produto J', quantity: 25, estimatedConsumptionTime: '1 semana' },
    { sku: '78987', description: 'Produto K', quantity: 30, estimatedConsumptionTime: '2 meses' },
    { sku: '13579', description: 'Produto L', quantity: 0, estimatedConsumptionTime: '3 semanas' },
    { sku: '24680', description: 'Produto M', quantity: 18, estimatedConsumptionTime: '1 mês' },
]);

const filters = ref({
    itemSKU: '',
    itemDescription: '',
    showOnlyStockItems: false,
});

const filteredItems = computed(() =>
    items.value.filter(item => {
        const matchesSKU = item.sku.includes(filters.value.itemSKU);
        const matchesDescription = item.description.includes(filters.value.itemDescription);
        const matchesStock = !filters.value.showOnlyStockItems || item.quantity > 0;
        return matchesSKU && matchesDescription && matchesStock;
    })
);
</script>

<style scoped>
.table-container {
    max-width: 800px;
    max-height: 400px;
    margin: 0 20px;
    overflow-y: auto;
    border: 1px solid #ccc;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th, td {
    padding: 10px;
    text-align: left;
    border: 1px solid #ddd;
}
</style>
