<template>
    <main class="login-page">
      <section class="login">
        <header>
          <h2>Login</h2>
        </header>
        <form @submit.prevent="handleLogin">
          
          <div class="form-group" style="position: relative;">
            <label for="username">Nome de Usuário</label>
            <input
              id="username"
              type="text"
              placeholder="Selecione seu usuário..."
              autocomplete="off"
              required
              v-model="username"
              @focus="onFocus"
              @blur="onBlur"
              @keydown.down.prevent="onKeyDown"
              @keydown.up.prevent="onKeyUp"
              @keydown.enter.prevent="onKeyEnter"
              class="login-field"
            />
            <ul v-if="showSuggestions && filteredUsers.length" class="suggestions-list">
              <li
                v-for="(user, index) in filteredUsers"
                :key="user"
                @mousedown.prevent="selectUser(user)"
                :class="{ selected: index === selectedIndex }"
              >
                {{ user }}
              </li>
            </ul>
          </div>
  
          <div class="form-group">
            <label for="password">Senha</label>
            <input
              id="password"
              type="password"
              placeholder="Digite sua senha..."
              autocomplete="current-password"
              required
              v-model="password"
              class="login-field"
            />
          </div>
  
          <button type="submit" class="login-field submit-field">Entrar</button>
          <p v-if="error" class="error-message">{{ error }}</p>
        </form>
      </section>
    </main>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import { useRouter } from 'vue-router';
  
  const username = ref('');
  const password = ref('');
  const error = ref(null);
  const showSuggestions = ref(false);
  
  const selectedIndex = ref(-1);
  
  const users = ['joao', 'maria', 'roberto'];
  
  const filteredUsers = computed(() => {
    if (!username.value) {
      return users;
    }
    return users.filter((user) =>
      user.toLowerCase().includes(username.value.toLowerCase())
    );
  });
  
  const authStore = useAuthStore();
  const router = useRouter();
  
  const handleLogin = async () => {
    try {
      await authStore.login({ username: username.value, password: password.value });
      router.push({ name: 'Home' });
    } catch (err) {
      error.value = 'Credenciais inválidas!';
    }
  };
  
  function selectUser(user) {
    username.value = user;
    showSuggestions.value = false;
  }
  
  function onBlur() {
    setTimeout(() => {
      showSuggestions.value = false;
    }, 100);
  }
  
  function onFocus() {
    showSuggestions.value = true;
    selectedIndex.value = -1;
  }
  
  watch(username, () => {
    selectedIndex.value = -1;
  });
  
  function onKeyDown() {
    if (!filteredUsers.value.length) return;
    showSuggestions.value = true;
    selectedIndex.value =
      (selectedIndex.value + 1) % filteredUsers.value.length;
  }
  
  function onKeyUp() {
    if (!filteredUsers.value.length) return;
    showSuggestions.value = true;
    if (selectedIndex.value === -1) {
      selectedIndex.value = filteredUsers.value.length - 1;
    } else {
      selectedIndex.value =
        (selectedIndex.value - 1 + filteredUsers.value.length) %
        filteredUsers.value.length;
    }
  }
  
  function onKeyEnter() {
    if (selectedIndex.value >= 0 && selectedIndex.value < filteredUsers.value.length) {
      selectUser(filteredUsers.value[selectedIndex.value]);
    }
  }
  </script>
  
  <style lang="css">
  html, body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    height: 100%;
  }
  
  .login-page {
    background-image: url('@/assets/login_background.jpg');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .login {
    background: rgba(0, 0, 0, 0.9);
    padding: 2rem;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 400px;
  }
  
  form {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 1rem;
    position: relative;
  }
  
  label {
    margin-bottom: 0.5rem;
    color: #ccc;
  }
  
  .login-field {
    padding: 0.5rem;
    border-radius: 4px;
    background-color: #000;
    font-size: 1rem;
    border: 1px solid #ccc;
    color: #ccc;
    width: 100%;
    box-sizing: border-box;
  }
  
  .suggestions-list {
    margin: 0;
    padding: 0;
    list-style: none;
    background: #333;
    color: #ccc;
    border: 1px solid #ccc;
    position: absolute;
    width: 100%;
    top: 65px;
    left: 0;
    z-index: 10;
  }
  
  .suggestions-list li {
    padding: 0.5rem;
    cursor: pointer;
    color: #ccc;
  }
  
  .suggestions-list li:hover {
    background: #ccc;
    color: #000;
  }
  
  .selected {
    background: #ccc;
    color: #00f;
  }
  
  .submit-field {
    cursor: pointer;
    margin-top: 1rem;
    transition: background-color 0.3s;
  }
  
  .submit-field:hover {
    background-color: #333;
  }
  
  .error-message {
    color: red;
    margin-top: 1rem;
    text-align: center;
  }
  </style>
  