import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAccessibilityStore } from '@/stores/accessibility'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Inicializa as configurações de acessibilidade
const accessibilityStore = useAccessibilityStore()
accessibilityStore.initialize()

app.mount('#app')
