<!-- PageContainer.vue - Container de página com loading e estados -->
<template>
  <div class="page-container">
    <!-- Loading overlay global -->
    <div v-if="globalLoading" class="page-loading-overlay">
      <LoadingSpinner size="large" :message="loadingMessage" />
    </div>

    <!-- Header da página -->
    <div v-if="title || $slots.header" class="page-header">
      <div class="page-header__content">
        <div class="page-header__title">
          <h1 v-if="title" class="page-title">{{ title }}</h1>
          <slot name="header" />
        </div>
        
        <div v-if="$slots.actions" class="page-header__actions">
          <slot name="actions" />
        </div>
      </div>
    </div>

    <!-- Conteúdo da página -->
    <div class="page-content">
      <!-- Estado de erro -->
      <div v-if="error" class="page-error">
        <div class="error-card">
          <div class="error-icon">⚠️</div>
          <h3>Ops! Algo deu errado</h3>
          <p>{{ error }}</p>
          <LoadingButton v-if="retryable" @click="$emit('retry')" variant="primary">
            Tentar novamente
          </LoadingButton>
        </div>
      </div>

      <!-- Estado vazio -->
      <div v-else-if="empty" class="page-empty">
        <div class="empty-card">
          <div class="empty-icon">📭</div>
          <h3>{{ emptyTitle || 'Nenhum item encontrado' }}</h3>
          <p>{{ emptyMessage || 'Não há dados para exibir no momento.' }}</p>
          <slot name="empty-actions" />
        </div>
      </div>

      <!-- Conteúdo principal -->
      <div v-else class="page-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from './LoadingSpinner.vue';
import LoadingButton from './LoadingButton.vue';

interface Props {
  title?: string;
  globalLoading?: boolean;
  loadingMessage?: string;
  error?: string;
  empty?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  retryable?: boolean;
}

interface Emits {
  (e: 'retry'): void;
}

withDefaults(defineProps<Props>(), {
  globalLoading: false,
  loadingMessage: 'Carregando...',
  empty: false,
  retryable: true,
});
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #f9fafb;
  position: relative;
}

.page-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(2px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 24px;
}

.page-header__content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.page-header__title {
  flex: 1;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.page-header__actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-error,
.page-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.error-card,
.empty-card {
  text-align: center;
  max-width: 400px;
  padding: 48px 24px;
}

.error-icon,
.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-card h3,
.empty-card h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.error-card p,
.empty-card p {
  margin: 0 0 24px 0;
  color: #6b7280;
  line-height: 1.5;
}

.page-body {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Responsividade */
@media (max-width: 768px) {
  .page-header {
    padding: 16px;
  }
  
  .page-header__content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .page-header__actions {
    justify-content: stretch;
  }
  
  .page-content {
    padding: 16px;
  }
  
  .page-title {
    font-size: 20px;
  }
}
</style>
