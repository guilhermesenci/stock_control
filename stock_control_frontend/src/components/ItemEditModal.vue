<!-- ItemEditModal.vue -->
<template>
    <div class="modal-backdrop">
      <div class="modal">
        <h2>Editar Item</h2>
        <form @submit.prevent="save">
          <div class="form-group">
            <label for="sku">SKU:</label>
            <input id="sku" v-model="localItem.sku" type="text" required />
          </div>
  
          <div class="form-group">
            <label for="description">Descrição:</label>
            <input id="description" v-model="localItem.description" type="text" required />
          </div>
  
          <div class="form-group">
            <label for="unityMeasure">Unidade de Medida:</label>
            <input id="unityMeasure" v-model="localItem.unityMeasure" type="text" required />
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
  import { reactive } from 'vue';
  
  export interface Item {
    sku: string;
    description: string;
    unityMeasure: string;
    active: boolean;
  }
  
  const props = defineProps<{
    item: Item;
  }>();
  
  const emit = defineEmits<{
    (e: 'cancel'): void;
    (e: 'save', updated: Item): void;
  }>();
  
  // cópia local para edição
  const localItem = reactive<Item>({ ...props.item });
  
  function save() {
    emit('save', { ...localItem });
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
  