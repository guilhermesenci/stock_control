<!-- UserEditModal.vue -->
<template>
    <div class="modal-backdrop">
      <div class="modal form-container">
        <h2>Editar Usuário</h2>
        <form @submit.prevent="save">
          <div class="form-group">
            <label for="username">Nome de usuário:</label>
            <input id="username" v-model="localUser.username" type="text" required />
          </div>
  
          <div class="form-group">
            <label for="firstName">Nome:</label>
            <input id="firstName" v-model="localUser.firstName" type="text" />
          </div>
  
          <div class="form-group">
            <label for="lastName">Sobrenome:</label>
            <input id="lastName" v-model="localUser.lastName" type="text" />
          </div>
  
          <div class="form-group">
            <label for="email">E‑mail:</label>
            <input id="email" v-model="localUser.email" type="email" required />
          </div>
  
          <div class="form-group">
            <label for="password">Senha:</label>
            <input id="password" v-model="localUser.password" type="password" />
          </div>

          <div class="form-group">
            <label for="password2">Confirmar Senha:</label>
            <input id="password2" v-model="localUser.password2" type="password" />
          </div>

          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" v-model="localUser.isSuperuser" />
              Usuário Master
            </label>
          </div>
  
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" v-model="localUser.isActive" />
              Está ativo
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
  import type { User, UpdateUserData } from '@/services/userService';
  
  const props = defineProps<{
    user: User;
  }>();
  
  const emit = defineEmits<{
    (e: 'cancel'): void;
    (e: 'save', updatedUser: UpdateUserData): void;
  }>();
  
  const error = ref<string|null>(null);

  // Criamos uma cópia local para edição
  const localUser = reactive<UpdateUserData>({
    username: props.user.username,
    email: props.user.email,
    firstName: props.user.firstName,
    lastName: props.user.lastName,
    isActive: props.user.isActive,
    isSuperuser: props.user.isMaster,
    permissionsList: props.user.permissionsList,
    password: '',
    password2: ''
  });
  
  // Ao salvar, emitimos o usuário atualizado
  function save() {
    error.value = null;
    
    // Validação de senha
    if (localUser.password || localUser.password2) {
      if (localUser.password !== localUser.password2) {
        console.log('As senhas não coincidem');
        console.log(localUser.password);
        error.value = 'As senhas não coincidem';
        return;
      }
      
      if (localUser.password && localUser.password.length < 8) {
        error.value = 'A senha deve ter pelo menos 8 caracteres';
        return;
      }
    }
    
    // If passwords are empty, remove them before sending
    const userData: UpdateUserData = { ...localUser };
    if (!userData.password) {
      delete userData.password;
      delete userData.password2;
    }
    
    emit('save', userData);
  }
  </script>
  