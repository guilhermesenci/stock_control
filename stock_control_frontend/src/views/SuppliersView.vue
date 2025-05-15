<!-- SuppliersView.vue -->
<template>
    <div class="suppliers-view view">
        <h1>Cadastro de Fornecedores</h1>
        
        <button class="btn-new-supplier inclusion-button" @click="showNewSupplierModal = true">Cadastrar novo fornecedor</button>

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

        <div class="suppliers-filters filter-container">
            <h2>Filtros</h2>
            <SuppliersFilters v-model="filters" @search="onSearch" />
        </div>

        <div class="suppliers-list list-container">
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