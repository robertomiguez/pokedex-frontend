<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  show: boolean;
  initialNote?: string;
  pokemonName?: string;
}>();

const emit = defineEmits<{
  (e: 'save', note: string): void;
  (e: 'close'): void;
}>();

const note = ref('');

watch(() => props.show, (newVal) => {
  if (newVal) {
    note.value = props.initialNote || '';
  }
});

function handleSave() {
  emit('save', note.value);
}

function handleClose() {
  emit('close');
}
</script>

<template>
  <div v-if="show" class="modal-backdrop" @click="handleClose">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Trainer Notes for {{ pokemonName }}</h3>
        <button class="close-btn" @click="handleClose">&times;</button>
      </div>
      
      <div class="modal-body">
        <textarea 
          v-model="note" 
          placeholder="Enter your notes here... (e.g. Strong against Fire, Bred for speed)"
          rows="5"
          maxlength="500"
          autofocus
        ></textarea>
        <div class="char-count">{{ note.length }}/500</div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="handleClose">Cancel</button>
        <button class="btn-save" @click="handleSave">Save Note</button>
      </div>
    </div>
  </div>
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
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.2s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0 0.5rem;
}

.modal-body {
  margin-bottom: 1.5rem;
}

textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s;
}

textarea:focus {
  outline: none;
  border-color: #667eea;
}

.char-count {
  text-align: right;
  font-size: 0.8rem;
  color: #999;
  margin-top: 0.25rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancel, .btn-save {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
}

.btn-cancel {
  background-color: #e9ecef;
  color: #495057;
}

.btn-cancel:hover {
  background-color: #dee2e6;
}

.btn-save {
  background-color: #667eea;
  color: white;
}

.btn-save:hover {
  background-color: #5a67d8;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
