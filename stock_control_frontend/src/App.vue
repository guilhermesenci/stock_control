<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import SideMenu from './components/SideMenu.vue'
import NotificationContainer from './components/NotificationContainer.vue'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<template>
  <header>
    <SideMenu />
  </header>

  <RouterView />
  
  <!-- Container global de notificações -->
  <NotificationContainer />
</template>
