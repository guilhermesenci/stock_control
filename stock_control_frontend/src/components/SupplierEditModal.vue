<!-- SupplierEditModal.vue -->
<template>
    <div class="modal-backdrop">
      <div class="modal form-container">
        <h2>{{ isNew ? 'Novo Fornecedor' : 'Editar Fornecedor' }}</h2>
        <form @submit.prevent="onSave">
          <div class="form-group">
            <label for="name">Nome do Fornecedor:</label>
            <input 
              id="name" 
              type="text" 
              v-model="formData.nomeFornecedor" 
              required
            />
          </div>
          <div class="form-group checkbox-group">
            <label>
              <input 
                type="checkbox" 
                v-model="formData.active"
              />
              Ativo
            </label>
          </div>
          <div class="actions">
            <button type="button" class="cancel-button" @click="$emit('cancel')">Cancelar</button>
            <button type="submit" class="save-button">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  import type { Fornecedor } from '@/services/supplierService';
  
  const props = defineProps<{
    supplier: Fornecedor;
  }>();
  
  const emit = defineEmits<{
    (e: 'cancel'): void;
    (e: 'save', supplier: Fornecedor): void;
  }>();
  
  const isNew = computed(() => !props.supplier.codFornecedor);
  
  const formData = ref<Fornecedor>({
    codFornecedor: props.supplier.codFornecedor,
    nomeFornecedor: props.supplier.nomeFornecedor,
    active: props.supplier.active,
  });
  
  function onSave() {
    emit('save', { ...formData.value });
  }
  </script>