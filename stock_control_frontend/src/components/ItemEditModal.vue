<!-- ItemEditModal.vue -->
<template>
    <div class="modal-backdrop">
      <div class="modal">
        <h2>{{ item.codSku ? 'Editar Item' : 'Cadastrar novo item' }}</h2>
        <form @submit.prevent="save">
          <div class="form-group">
            <label for="codSku">SKU:</label>
            <input 
              id="codSku" 
              v-model="localItem.codSku" 
              type="text" 
              required 
              :disabled="!!item.codSku"
              :class="{ 'disabled': !!item.codSku }"
            />
          </div>
  
          <div class="form-group">
            <label for="descricaoItem">Descrição:</label>
            <input id="descricaoItem" v-model="localItem.descricaoItem" type="text" required />
          </div>
  
          <div class="form-group">
            <label for="unidMedida">Unidade de Medida:</label>
            <input id="unidMedida" v-model="localItem.unidMedida" type="text" required />
          </div>
  
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" v-model="localItem.active" />
              Está ativo?
            </label>
          </div>
  
          <div class="actions">
            <button type="button" @click="$emit('cancel')">Cancelar</button>
            <button type="submit">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { reactive } from 'vue'
  import type { Item } from '@/services/itemService'
  
  const props = defineProps<{
    item: Item
  }>()
  
  const emit = defineEmits<{
    (e: 'cancel'): void
    (e: 'save', updated: Item): void
  }>()
  
  // cópia local para edição
  const localItem = reactive<Item>({ ...props.item })
  
  function save() {
    emit('save', { ...localItem })
  }
  </script>
  
  <style scoped>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .modal {
    padding: 1.5rem;
    border-radius: 8px;
    width: 360px;
  }
  .form-group {
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
  }
  .form-group.checkbox-group {
    flex-direction: row;
    align-items: center;
  }
  label {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  input[type="text"] {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  input[type="text"].disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
  .actions button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .actions button:first-child {
    background: #ccc;
  }
  .actions button:last-child {
    background: #007bff;
    color: white;
  }
  .actions button:last-child:hover {
    background: #0056b3;
  }
  </style>
  