<!-- ItemEditModal.vue -->
<template>
    <div class="modal-backdrop">
      <div class="modal form-container">
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
              :class="{ 'disabled readonly-field': !!item.codSku }"
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
            <button class="cancel-button" type="button" @click="$emit('cancel')">Cancelar</button>
            <button class="save-button" type="submit">Salvar</button>
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
  
  