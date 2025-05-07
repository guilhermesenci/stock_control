<!-- PermissionsModal.vue -->
<template>
    <div class="modal-backdrop">
      <div class="modal">
        <h2>Permissões de {{ user.name }}</h2>
        <table class="permissions-table">
          <thead>
            <tr>
              <th>Tela</th>
              <th>Acesso</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="screen in screens" :key="screen.id">
              <td>{{ screen.label }}</td>
              <td>
                <input
                  type="checkbox"
                  :value="screen.id"
                  v-model="localPermissions"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <div class="actions">
          <button @click="$emit('close')">Cancelar</button>
          <button @click="save">Salvar</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue';
  
  const props = defineProps<{
    user: { name: string; email: string };
    screens: { id: string; label: string }[];
    initialPermissions: string[];
  }>();
  
  const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'save', newPermissions: string[]): void;
  }>();
  
  // permissões editáveis localmente
  const localPermissions = ref<string[]>([]);
  
  watch(() => props.initialPermissions, perms => {
    localPermissions.value = [...perms];
  }, { immediate: true });
  
  function save() {
    emit('save', localPermissions.value);
  }
  </script>
  
  <style scoped>
  .modal-backdrop {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .modal {
    padding: 1.5rem;
    border-radius: 8px;
    width: 400px;
  }
  .permissions-table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
  }
  .permissions-table th,
  .permissions-table td {
    border: 1px solid #ddd;
    padding: 0.5rem;
    text-align: left;
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
  </style>
  