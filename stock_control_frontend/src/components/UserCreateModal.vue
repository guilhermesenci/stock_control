<!-- UserCreateModal.vue -->
<template>
  <div class="modal-backdrop">
    <div class="modal form-container">
      <h2>Criar Novo Usuário</h2>
      <form @submit.prevent="save">
        <div class="form-group">
          <label for="user_name">Nome de usuário:</label>
          <input id="user_name" v-model="newUser.username" type="text" required />
        </div>

        <div class="form-group">
          <label for="firstName">Nome:</label>
          <input id="firstName" v-model="newUser.firstName" type="text" />
        </div>

        <div class="form-group">
          <label for="lastName">Sobrenome:</label>
          <input id="lastName" v-model="newUser.lastName" type="text" />
        </div>

        <div class="form-group">
          <label for="email">E‑mail:</label>
          <input id="email" v-model="newUser.email" type="email" required />
        </div>

        <div class="form-group">
          <label for="password">Senha:</label>
          <input id="password" v-model="newUser.password" type="password" required />
        </div>

        <div class="form-group">
          <label for="password2">Confirmar Senha:</label>
          <input id="password2" v-model="newUser.password2" type="password" required />
        </div>

        <div class="form-group checkbox-group">
          <label>
            <input type="checkbox" v-model="newUser.isSuperuser" />
            Usuário Master (Admin)
          </label>
        </div>

        <div class="form-group checkbox-group">
          <label>
            <input type="checkbox" v-model="newUser.isActive" />
            Usuário Ativo
          </label>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
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
import { reactive, ref } from 'vue';
import type { CreateUserData } from '@/services/userService';

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'save', userData: CreateUserData): void;
}>();

const error = ref<string|null>(null);

// Modelo de dados para criação de usuário
const newUser = reactive<CreateUserData>({
  username: '',
  email: '',
  password: '',
  password2: '',
  firstName: '',
  lastName: '',
  isActive: true,
  isSuperuser: false,
  permissionsList: ['dashboard'] // Permissão básica
});

// Validação e envio do formulário
function save() {
  error.value = null;
  
  // Validação básica
  if (newUser.password !== newUser.password2) {
    error.value = 'As senhas não coincidem';
    return;
  }
  
  if (newUser.password.length < 8) {
    error.value = 'A senha deve ter pelo menos 8 caracteres';
    return;
  }
  
  emit('save', { ...newUser });
}
</script>