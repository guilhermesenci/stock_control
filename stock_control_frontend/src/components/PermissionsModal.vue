<!-- PermissionsModal.vue -->
<template>
    <div class="modal-backdrop">
      <div class="modal form-container">
        <h2>Permissões de {{ user.username }}</h2>
        <p class="permission-info">Selecione as telas que o usuário terá acesso:</p>
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
        <div class="permission-help">
          <p><strong>Nota:</strong> Usuários sem permissões não conseguirão acessar as telas correspondentes.</p>
        </div>
        <div class="form-actions">
          <button class="btn-cancel" @click="$emit('close')">Cancelar</button>
          <button class="btn-submit" @click="save">Salvar</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue';
  
  const props = defineProps<{
    user: { username: string; email: string };
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
    
    overflow-y: auto;
  }
  .permission-info {
    margin-bottom: 0.3rem;
  }
  .permission-help {
    margin-top: 1rem;
    font-size: 0.8rem;
    color: #666;
    padding: 0.75rem;
    border-radius: 4px;
    border-left: 3px solid #007bff;
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
    margin-top: 1rem;
  }
  .form-actions button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: grab;
  }
  
  .save-btn {
    background: #007bff;
    color: white;
  }
  .save-btn:hover {
    background: #0056b3;
  }
  </style>
  