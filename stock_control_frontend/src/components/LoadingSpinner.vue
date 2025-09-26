<!-- LoadingSpinner.vue - Componente de loading reutilizável -->
<template>
  <div 
    :class="[
      'loading-spinner',
      `loading-spinner--${size}`,
      { 'loading-spinner--overlay': overlay }
    ]"
  >
    <div class="spinner">
      <div class="spinner__circle"></div>
    </div>
    <p v-if="message" class="loading-spinner__message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  overlay?: boolean;
}

withDefaults(defineProps<Props>(), {
  size: 'medium',
  overlay: false,
});
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.loading-spinner--overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(2px);
  z-index: 1000;
}

.spinner {
  position: relative;
}

.spinner__circle {
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner--small .spinner__circle {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.loading-spinner--medium .spinner__circle {
  width: 32px;
  height: 32px;
  border-width: 3px;
}

.loading-spinner--large .spinner__circle {
  width: 48px;
  height: 48px;
  border-width: 4px;
}

.loading-spinner__message {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  max-width: 200px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Variantes de cor */
.loading-spinner--success .spinner__circle {
  border-top-color: #10b981;
}

.loading-spinner--error .spinner__circle {
  border-top-color: #ef4444;
}

.loading-spinner--warning .spinner__circle {
  border-top-color: #f59e0b;
}
</style>
