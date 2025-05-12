<!-- SupplierEditModal.vue -->
<template>
    <div class="modal">
      <div class="modal-content">
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
          <div class="form-group checkbox">
            <label>
              <input 
                type="checkbox" 
                v-model="formData.active"
              />
              Ativo
            </label>
          </div>
          <div class="modal-actions">
            <button type="button" @click="$emit('cancel')">Cancelar</button>
            <button type="submit">Salvar</button>
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
  
  <style scoped>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal-content {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    min-width: 400px;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
  
  .form-group input[type="text"] {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .form-group.checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .form-group.checkbox label {
    margin-bottom: 0;
  }
  
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
  }
  
  .modal-actions button {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .modal-actions button[type="button"] {
    background-color: #f8f9fa;
    border: 1px solid #ccc;
  }
  
  .modal-actions button[type="submit"] {
    background-color: #007bff;
    border: none;
    color: white;
  }
  
  .modal-actions button[type="submit"]:hover {
    background-color: #0056b3;
  }
  </style> 