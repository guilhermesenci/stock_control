<!-- NotificationContainer.vue - Container para exibir notificações -->
<template>
  <div class="notification-container">
    <TransitionGroup name="notification" tag="div" class="notifications-list">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'notification',
          `notification--${notification.type}`,
          { 'notification--persistent': notification.persistent }
        ]"
      >
        <div class="notification__icon">
          <IconSuccess v-if="notification.type === 'success'" />
          <IconError v-if="notification.type === 'error'" />
          <IconWarning v-if="notification.type === 'warning'" />
          <IconInfo v-if="notification.type === 'info'" />
        </div>

        <div class="notification__content">
          <h4 class="notification__title">{{ notification.title }}</h4>
          <div class="notification__message" v-html="formatMessage(notification.message)"></div>
          
          <div v-if="notification.actions?.length" class="notification__actions">
            <button
              v-for="action in notification.actions"
              :key="action.label"
              :class="[
                'notification__action',
                `notification__action--${action.style || 'secondary'}`
              ]"
              @click="action.action"
            >
              {{ action.label }}
            </button>
          </div>
        </div>

        <button
          v-if="!notification.persistent"
          class="notification__close"
          @click="removeNotification(notification.id)"
          aria-label="Fechar notificação"
        >
          <IconClose />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNotificationStore } from '@/stores/notifications';

// Ícones simples em SVG
const IconSuccess = {
  template: `
    <svg viewBox="0 0 24 24" fill="currentColor" class="notification-icon">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
  `
};

const IconError = {
  template: `
    <svg viewBox="0 0 24 24" fill="currentColor" class="notification-icon">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>
  `
};

const IconWarning = {
  template: `
    <svg viewBox="0 0 24 24" fill="currentColor" class="notification-icon">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
    </svg>
  `
};

const IconInfo = {
  template: `
    <svg viewBox="0 0 24 24" fill="currentColor" class="notification-icon">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
    </svg>
  `
};

const IconClose = {
  template: `
    <svg viewBox="0 0 24 24" fill="currentColor" class="notification-icon">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>
  `
};

const notificationStore = useNotificationStore();

const notifications = computed(() => notificationStore.notifications);

function removeNotification(id: string) {
  notificationStore.remove(id);
}

function formatMessage(message: string): string {
  // Converte quebras de linha em <br> para exibição HTML
  return message.replace(/\n/g, '<br>');
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
  width: 100%;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: white;
  border-left: 4px solid;
  position: relative;
  min-width: 300px;
  max-width: 400px;
}

.notification--success {
  border-left-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
}

.notification--error {
  border-left-color: #ef4444;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
}

.notification--warning {
  border-left-color: #f59e0b;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}

.notification--info {
  border-left-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.notification__icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  margin-top: 2px;
}

.notification--success .notification__icon {
  color: #10b981;
}

.notification--error .notification__icon {
  color: #ef4444;
}

.notification--warning .notification__icon {
  color: #f59e0b;
}

.notification--info .notification__icon {
  color: #3b82f6;
}

.notification-icon {
  width: 100%;
  height: 100%;
}

.notification__content {
  flex: 1;
  min-width: 0;
}

.notification__title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
}

.notification__message {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
  word-wrap: break-word;
  white-space: pre-line;
}

.notification__actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.notification__action {
  padding: 4px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification__action--primary {
  background: #3b82f6;
  color: white;
}

.notification__action--primary:hover {
  background: #2563eb;
}

.notification__action--secondary {
  background: #f3f4f6;
  color: #374151;
}

.notification__action--secondary:hover {
  background: #e5e7eb;
}

.notification__action--danger {
  background: #ef4444;
  color: white;
}

.notification__action--danger:hover {
  background: #dc2626;
}

.notification__close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  cursor: pointer;
  color: #9ca3af;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification__close:hover {
  color: #6b7280;
}

.notification__close .notification-icon {
  width: 16px;
  height: 16px;
}

/* Animações */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Responsividade */
@media (max-width: 480px) {
  .notification-container {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .notification {
    min-width: auto;
    max-width: none;
  }
}
</style>