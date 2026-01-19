<script setup lang="ts">


const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-backdrop" @click.self="emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Welcome to Pokedex!</h2>
          <button class="close-btn" @click="emit('close')">&times;</button>
        </div>
        
        <div class="modal-body">
          <p class="intro">Here are some pro tips to help you catch 'em all:</p>
          
          <div class="tip-item">
            <div class="icon">🖱️</div>
            <div class="text">
              <strong>Right Click</strong> on any Pokémon card to open the Context Menu (Catch, Notes, Release).
            </div>
          </div>
          
          <div class="tip-item">
            <div class="icon">⌨️</div>
            <div class="text">
              Hold <strong>Ctrl + Click</strong> (or Command + Click) to select multiple Pokémon for bulk actions.
            </div>
          </div>

           <div class="tip-item">
            <div class="icon">📱</div>
            <div class="text">
              On <strong>Mobile</strong>, long-press a card to open the menu.
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="primary-btn" @click="emit('close')">Got it!</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; /* Higher than context menu */
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1.5rem;
}

.intro {
  margin-bottom: 1.5rem;
  color: #666;
  font-size: 1.1rem;
}

.tip-item {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  align-items: flex-start;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.icon {
  font-size: 2rem;
}

.text {
  font-size: 1rem;
  color: #2c3e50;
  line-height: 1.5;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.primary-btn {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.primary-btn:hover {
  background-color: #1976D2;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Vue Transition Classes */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
