<!-- LoginView.vue -->
<template>
    <div class="login-container">
        <form @submit.prevent="onSubmit" class="login-form">
            <h1>Login</h1>
            <div class="form-group">
                <label for="username">Usuário</label>
                <input
                    type="text"
                    id="username"
                    v-model="username"
                    required
                    autocomplete="username"
                />
            </div>
            <div class="form-group">
                <label for="password">Senha</label>
                <input
                    type="password"
                    id="password"
                    v-model="password"
                    required
                    autocomplete="current-password"
                />
            </div>
            <button type="submit" :disabled="loading">
                {{ loading ? 'Entrando...' : 'Entrar' }}
            </button>
            <p v-if="error" class="error">{{ error }}</p>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function onSubmit() {
    try {
        console.log('LoginView: Iniciando login')
        loading.value = true
        error.value = ''
        
        await authStore.login({ username: username.value, password: password.value })
        console.log('LoginView: Login bem sucedido')
        
        // Redireciona para a página inicial
        router.push('/')
    } catch (err: any) {
        console.error('LoginView: Erro no login:', err)
        error.value = err.response?.data?.detail || 'Erro ao fazer login'
    } finally {
        loading.value = false
    }
}
</script>

<style lang="css">
html,
body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    height: 100%;
}

.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f5f5;
}

.login-form {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
}

.form-group {
    margin-bottom: 1rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    color: #333;
}

input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

button {
    width: 100%;
    padding: 0.75rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
}

button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.error {
    color: #dc3545;
    margin-top: 1rem;
    text-align: center;
}
</style>