<!-- SuppliersView.vue -->
<template>
    <div class="suppliers-view">
        <h1>Cadastro de Fornecedores</h1>
        
        <button class="btn-new-supplier" @click="showNewSupplierModal = true">Cadastrar novo fornecedor</button>

        <SupplierEditModal
            v-if="showNewSupplierModal"
            :supplier="emptySupplier"
            @cancel="showNewSupplierModal = false"
            @save="onNewSupplierSave"
        />

        <SupplierEditModal
            v-if="showEditSupplierModal && supplierToEdit"
            :supplier="supplierToEdit"
            @cancel="showEditSupplierModal = false"
            @save="onEditSupplierSave"
        />

        <div class="suppliers-filters">
            <h2>Filtros</h2>
            <SuppliersFilters v-model="filters" @search="onSearch" />
        </div>

        <div class="suppliers-list">
            <h2>Lista de fornecedores</h2>
            <SuppliersList :filters="filters" :refreshKey="refreshKey" @edit="onEditSupplier" @delete="onDeleteSupplier" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import SuppliersFilters from '@/components/SuppliersFilters.vue';
import SuppliersList from '@/components/SuppliersList.vue';
import SupplierEditModal from '@/components/SupplierEditModal.vue';
import { supplierService, type Fornecedor } from '@/services/supplierService';

interface SupplierFilters {
    supplierName: string;
    showOnlyActive: boolean;
}

const filters = ref<SupplierFilters>({
    supplierName: '',
    showOnlyActive: true,
});

// chave reativa para forçar reload
const refreshKey = ref(0);

// controle do modal
const showNewSupplierModal = ref(false);
const showEditSupplierModal = ref(false);
const supplierToEdit = ref<Fornecedor>({
    codFornecedor: 0,
    nomeFornecedor: '',
    active: true,
});
const emptySupplier: Fornecedor = {
    codFornecedor: 0,
    nomeFornecedor: '',
    active: true,
};

function onSearch() {
    console.log('SuppliersView: Evento de busca recebido');
    console.log('SuppliersView: Filtros atuais:', filters.value);
    
    // incrementa para disparar watcher em SuppliersList
    refreshKey.value++;
    console.log('SuppliersView: refreshKey incrementado para:', refreshKey.value);
}

// observa mudanças nos filtros
watch(filters, (newValue) => {
    console.log('SuppliersView: Filtros atualizados:', newValue);
    // Não precisamos chamar onSearch aqui, pois o SuppliersFilters já emite o evento search
}, { deep: true });

async function onNewSupplierSave(newSupplier: Fornecedor) {
    try {
        await supplierService.createSupplier(newSupplier);
        showNewSupplierModal.value = false;
        onSearch();
    } catch (err) {
        console.error('Erro ao cadastrar fornecedor:', err);
    }
}

function onEditSupplier(supplier: Fornecedor) {
    supplierToEdit.value = { ...supplier };
    showEditSupplierModal.value = true;
}

async function onEditSupplierSave(updatedSupplier: Fornecedor) {
    try {
        await supplierService.updateSupplier(updatedSupplier);
        showEditSupplierModal.value = false;
        onSearch();
    } catch (err) {
        console.error('Erro ao editar fornecedor:', err);
    }
}

async function onDeleteSupplier(supplier: Fornecedor) {
    if (confirm(`Tem certeza que deseja deletar o fornecedor "${supplier.nomeFornecedor}"?`)) {
        try {
            await supplierService.deleteSupplier(supplier.codFornecedor);
            onSearch();
        } catch (err) {
            console.error('Erro ao deletar fornecedor:', err);
        }
    }
}
</script>

<style scoped lang="scss">
.suppliers-view {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;

    h1 {
        margin-bottom: 2rem;
    }
}

.btn-new-supplier {
    margin-bottom: 1rem;
    padding: 0.5rem 1rem;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;

    &:hover {
        background: #218838;
    }
}

.suppliers-filters {
    margin-bottom: 2rem;
    padding: 1rem;
    background-color: transparent;
    border-radius: 8px;

    h2 {
        margin-bottom: 1rem;
        font-size: 1.2rem;
        color: #333;
    }
}

.suppliers-list {
    h2 {
        margin-bottom: 1rem;
        font-size: 1.2rem;
        color: #333;
    }
}
</style> 