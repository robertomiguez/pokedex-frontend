<script setup lang="ts">
import { useNotificationStore } from '@/stores/notifications';
import { storeToRefs } from 'pinia';

const store = useNotificationStore();
const { notifications } = storeToRefs(store);
const { removeNotification } = store;

function getTypeClass(type: string) {
  switch (type) {
    case 'success': return 'toast-success';
    case 'error': return 'toast-error';
    case 'warning': return 'toast-warning';
    default: return 'toast-info';
  }
}
</script>

<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        class="toast-message"
        :class="getTypeClass(notification.type)"
      >
        <span>{{ notification.message }}</span>
        <button @click="removeNotification(notification.id)" class="close-btn">×</button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast-message {
  padding: 12px 20px;
  border-radius: 4px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 250px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.toast-info { background-color: #2196F3; }
.toast-success { background-color: #4CAF50; }
.toast-warning { background-color: #FF9800; }
.toast-error { background-color: #F44336; }

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  margin-left: 10px;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
