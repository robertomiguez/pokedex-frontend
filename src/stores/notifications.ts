import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Notification } from '@/types/ui';

export const useNotificationStore = defineStore('notifications', () => {
    const notifications = ref<Notification[]>([]);

    function addNotification(notification: Omit<Notification, 'id'>) {
        const id = Date.now().toString();
        const newNotification = { ...notification, id };
        notifications.value.push(newNotification);

        if (notification.duration !== 0) {
            setTimeout(() => {
                removeNotification(id);
            }, notification.duration || 3000);
        }
    }

    function removeNotification(id: string) {
        const index = notifications.value.findIndex(n => n.id === id);
        if (index !== -1) {
            notifications.value.splice(index, 1);
        }
    }

    return {
        notifications,
        addNotification,
        removeNotification
    };
});
