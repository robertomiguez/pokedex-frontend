<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

const props = defineProps<{
    show: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}>();

const emit = defineEmits<{
    (e: 'confirm'): void;
    (e: 'cancel'): void;
}>();

function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && props.show) {
        emit('cancel');
    }
}

onMounted(() => document.addEventListener('keydown', handleKeydown));
onUnmounted(() => document.removeEventListener('keydown', handleKeydown));
</script>

<template>
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="show" class="modal-overlay" @click.self="emit('cancel')">
                <div class="modal-content" role="dialog" aria-modal="true">
                    <div class="modal-header" :class="type || 'info'">
                        <h3>{{ title }}</h3>
                        <button class="close-btn" @click="emit('cancel')">×</button>
                    </div>
                    
                    <div class="modal-body">
                        <p>{{ message }}</p>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn btn-cancel" @click="emit('cancel')">
                            {{ cancelText || 'Cancel' }}
                        </button>
                        <button 
                            class="btn btn-confirm" 
                            :class="type || 'info'"
                            @click="emit('confirm')"
                            ref="confirmBtn"
                        >
                            {{ confirmText || 'Confirm' }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.3s ease-out;
    overflow: hidden;
}

.modal-header {
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
}

.modal-header.danger { background-color: #fff5f5; color: #c53030; }
.modal-header.warning { background-color: #fffaf0; color: #c05621; }
.modal-header.info { background-color: #ebf8ff; color: #2c5282; }

.modal-header h3 {
    margin: 0;
    font-size: 1.1rem;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    line-height: 1;
    color: inherit;
    opacity: 0.7;
}

.modal-body {
    padding: 1.5rem;
    color: #4a5568;
    line-height: 1.5;
}

.modal-footer {
    padding: 1rem;
    background-color: #f7fafc;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    border-top: 1px solid #eee;
}

.btn {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.2s;
}

.btn-cancel {
    background-color: white;
    color: #4a5568;
    border-color: #cbd5e0;
}

.btn-cancel:hover { background-color: #f7fafc; }

.btn-confirm { color: white; }
.btn-confirm.danger { background-color: #e53e3e; }
.btn-confirm.danger:hover { background-color: #c53030; }

.btn-confirm.warning { background-color: #dd6b20; }
.btn-confirm.warning:hover { background-color: #c05621; }

.btn-confirm.info { background-color: #3182ce; }
.btn-confirm.info:hover { background-color: #2b6cb0; }

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@keyframes slideIn {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
</style>
