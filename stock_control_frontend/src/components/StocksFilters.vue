<template>
    <div class="stock-filters">
        <FilterInput
            id="stock-date"
            label="Estoque no dia:"
            type="date"
            v-model="filters.stockDate"
        />
        <FilterInput
            id="item-sku"
            label="SKU do produto:"
            type="text"
            v-model="filters.itemSKU"
        />
        <FilterInput
            id="item-description"
            label="Descrição do produto:"
            type="text"
            v-model="filters.itemDescription"
        />
        <FilterCheckbox
            label="Exibir apenas produtos com estoque:"
            v-model="filters.showOnlyStockItems"
        />
        <div class="search">
            <button @click="onSearch">Pesquisar</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import FilterInput from './FilterInput.vue';
import FilterCheckbox from './FilterCheckbox.vue';

const filters = ref({
    stockDate: '',
    itemSKU: '',
    itemDescription: '',
    showOnlyStockItems: false,
});

const onSearch = () => {
    console.log('Filters:', filters.value);
};
</script>

<style scoped>
.stock-filters {
    padding: 20px;
    border-radius: 5px;
    margin: 0 auto 20px; /* Center the div horizontally */
    display: flex;
    flex-direction: row;
    gap: 40px;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box; /* Ensure padding and border are included in width */
}
.search button {
    font-size: 1rem;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
</style>
