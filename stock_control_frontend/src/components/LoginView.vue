<template>
    <div class="login-page">
      <div class="login">
        <h2>Bla</h2>
        <form @submit.prevent="handleLogin">
          <label for="email">Email:</label>
          <input id="email" type="email" v-model="email" required />
  
          <label for="password">Senha:</label>
          <input id="password" type="password" v-model="password" required />
  
          <button type="submit">Entrar</button>
        </form>
        <p v-if="error">{{ error }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useAuthStore } from '@/store/auth';
  import { useRouter } from 'vue-router';
  
  const email = ref('');
  const password = ref('');
  const error = ref(null);
  const authStore = useAuthStore();
  const router = useRouter();
  
  const handleLogin = async () => {
    try {
      await authStore.login({ email: email.value, password: password.value });
      router.push({ name: 'Home' });
    } catch (err) {
      error.value = 'Credenciais inválidas!';
    }
  };
  </script>
  
  <style scoped>
  .login-page {
    /* Define a imagem de fundo */
    background-image: url('@/assets/login_background.jpg');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    min-height: 100vh; /* Garante que a div ocupe toda a altura da tela */
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  /* Estilos do formulário de login permanecem os mesmos */
  .login {
    background: rgba(255, 255, 255, 0.9);
    padding: 2rem;
    border-radius: 8px;
  }
  </style>
  