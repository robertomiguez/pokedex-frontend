<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue';
import { RouterView } from 'vue-router';
import ReloadPrompt from '@/components/layout/ReloadPrompt.vue';
import ToastNotification from '@/components/ui/ToastNotification.vue';
import { onErrorCaptured } from 'vue';
import { useNotificationStore } from '@/stores/notifications';

const notificationStore = useNotificationStore();

onErrorCaptured((err) => {
  console.error('Captured Error:', err);
  notificationStore.addNotification({
    message: 'An unexpected error occurred. Please try again.',
    type: 'error',
    duration: 5000
  });
  return false; // Prevent error from propagating further if handled
});
</script>

<template>
  <AppLayout>
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
    <ReloadPrompt />
    <ToastNotification />
  </AppLayout>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
