<!-- UserEditModal.vue -->
<template>
    <div class="modal-backdrop">
      <div class="modal">
        <h2>Editar Usuário</h2>
        <form @submit.prevent="save">
          <div class="form-group">
            <label for="name">Nome:</label>
            <input id="name" v-model="localUser.name" type="text" required />
          </div>
  
          <div class="form-group">
            <label for="email">E‑mail:</label>
            <input id="email" v-model="localUser.email" type="email" required />
          </div>
  
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" v-model="localUser.isMaster" />
              Usuário Master
            </label>
          </div>
  
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" v-model="localUser.isActive" />
              Está ativo
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
  import { reactive, toRefs } from 'vue';
  
  interface User {
    name: string;
    email: string;
    isMaster: boolean;
    isActive: boolean;
    permissionsList: string[];
  }
  
  const props = defineProps<{
    user: User;
  }>();
  
  const emit = defineEmits<{
    (e: 'cancel'): void;
    (e: 'save', updatedUser: User): void;
  }>();
  
  // Criamos uma cópia local para edição
  const localUser = reactive({ ...props.user });
  
  // Ao salvar, emitimos o usuário atualizado
  function save() {
    emit('save', { ...localUser });
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
  input[type="text"],
  input[type="email"] {
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
  