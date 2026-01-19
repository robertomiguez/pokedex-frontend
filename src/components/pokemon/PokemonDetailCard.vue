<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Pokemon, CaughtPokemon } from '@/types/domain';

interface Props {
  pokemon: Pokemon;
  isCaught: boolean;
  caughtData?: CaughtPokemon | null;
  showActions?: boolean;
  showNotes?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  showNotes: true,
  caughtData: null
});

const emit = defineEmits<{
  (e: 'action'): void;
  (e: 'edit-note'): void;
}>();

const showShareModal = ref(false);
const copied = ref(false);

const caughtDateFormatted = computed(() => {
  if (!props.caughtData) return null;
  const date = new Date(props.caughtData.caughtAt);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
});

const currentNote = computed(() => {
  return props.caughtData?.notes || '';
});

const displayNote = computed(() => {
  const note = currentNote.value;
  if (note.length > 30) {
    return note.substring(0, 30) + '...';
  }
  return note;
});

const typeColors: Record<string, string> = {
  normal: '#A8A878', fire: '#F08030', water: '#6890F0', grass: '#78C850',
  electric: '#F8D030', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
  ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
  rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', steel: '#B8B8D0',
  dark: '#705848', fairy: '#EE99AC',
};

function getTypeColor(type: string) {
  return typeColors[type] || '#777';
}

async function sharePokemon() {
  const shareData = {
    title: `Check out ${props.pokemon.name}!`,
    text: `I found this cool Pokémon: ${props.pokemon.name} (#${props.pokemon.id})`,
    url: window.location.href,
  };

  // Try native share first (Mobile)
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err) {
      console.log('Native share cancelled or failed, falling back to modal');
    }
  }

  // Fallback to custom modal (Desktop)
  showShareModal.value = true;
  copyLink(); // Auto-copy for convenience
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    copied.value = true;
    setTimeout(() => copied.value = false, 2000);
  } catch (err) {
    console.error('Failed to copy link:', err);
  }
}

function closeShareModal() {
  showShareModal.value = false;
  copied.value = false;
}

function selectInput(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target) {
    target.select();
  }
}
</script>

<template>
  <div class="detail-card">
    <div class="header">
      <h1>{{ pokemon.name }}</h1>
      <div class="header-right">
        <button @click="sharePokemon" class="share-btn" title="Share Pokémon">
          <!-- Share Node Icon -->
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
        </button>
        <span class="id">#{{ pokemon.id.toString().padStart(3, '0') }}</span>
      </div>
    </div>

    <div class="caught-info" v-if="isCaught && caughtData">
      <span class="caught-star">★</span>
      <span class="caught-text">Caught on {{ caughtDateFormatted }}</span>
    </div>

    <div class="content-split">
      <div class="image-section">
        <img :src="pokemon.imageUrl" :alt="pokemon.name" />
        <div class="types">
          <span 
            v-for="type in pokemon.types" 
            :key="type"
            class="type-badge"
            :style="{ backgroundColor: getTypeColor(type) }"
          >
            {{ type }}
          </span>
        </div>
      </div>

      <div class="stats-section">
        <h2>Stats</h2>
        <div class="stat-row" v-for="(value, stat) in pokemon.stats" :key="stat">
          <span class="stat-name">{{ stat }}</span>
          <div class="stat-bar-container">
            <div class="stat-bar"
                 :style="{ width: Math.min((value / 255) * 100, 100) + '%', backgroundColor: getTypeColor(pokemon.types[0] || 'normal') }"
            ></div>
          </div>
          <span class="stat-val">{{ value }}</span>
        </div>
        
        <div class="physical-stats">
          <div class="p-stat">
            <strong>Height:</strong> {{ pokemon.height / 10 }}m
          </div>
          <div class="p-stat">
            <strong>Weight:</strong> {{ pokemon.weight / 10 }}kg
          </div>
        </div>

        <!-- Notes Section -->
        <div class="notes-section" v-if="showNotes && isCaught && caughtData">
          <div class="notes-header">
            <h3>Trainer Notes</h3>
            <button @click="emit('edit-note')" class="edit-note-btn">
              {{ currentNote ? 'Edit Notes' : 'Add Trainer Notes' }}
            </button>
          </div>
          <div v-if="currentNote" class="notes-content">
            {{ displayNote }}
          </div>
          <div v-else class="notes-empty">
            No notes added yet.
          </div>
        </div>
      </div>
    </div>

    <div class="actions" v-if="showActions && !isCaught">
      <button 
        class="action-button catch" 
        @click="emit('action')"
      >
        Catch!
      </button>
    </div>

    <!-- Share Modal -->
    <div v-if="showShareModal" class="modal-overlay" @click.self="closeShareModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Share Pokémon</h3>
          <button class="close-btn" @click="closeShareModal">×</button>
        </div>
        <div class="modal-body">
          <p>Share this link with your fellow trainers:</p>
          <div class="link-container">
            <input 
              type="text" 
              readonly 
              :value="`https://pokedex.app/pokemon/${pokemon.id}`" 
              class="link-input"
              @click="selectInput"
            />
          </div>
          <div class="feedback-area">
             <span v-if="copied" class="copied-badge">✅ Copied to clipboard!</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  position: relative;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  text-transform: capitalize;
}

.header h1 {
  margin: 0;
  font-size: 2.5rem;
  color: #2c3e50;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.share-btn {
  background: none;
  border: 1px solid #eee;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.share-btn:hover {
  background-color: #f0f0f0;
  color: #333;
  border-color: #ccc;
}

.id {
  font-size: 1.5rem;
  color: #aaa;
  font-weight: 700;
}

.caught-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%);
  padding: 0.6rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #ffc107;
}

.caught-star {
  color: #FFD700;
  font-size: 1.3rem;
}

.caught-text {
  color: #856404;
  font-weight: 500;
  font-size: 0.95rem;
}

.content-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 2rem;
}

.image-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.image-section img {
  width: 100%;
  max-width: 300px;
  height: auto;
  margin-bottom: 1.5rem;
}

.types {
  display: flex;
  gap: 0.5rem;
}

.type-badge {
  color: white;
  padding: 0.3rem 1rem;
  border-radius: 1rem;
  text-transform: capitalize;
  font-weight: 600;
}

.stats-section h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.stat-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.8rem;
  gap: 1rem;
}

.stat-name {
  width: 100px;
  text-transform: capitalize;
  font-weight: 500;
  color: #666;
}

.stat-bar-container {
  flex: 1;
  height: 10px;
  background: #eee;
  border-radius: 5px;
  overflow: hidden;
}

.stat-bar {
  height: 100%;
  border-radius: 5px;
}

.stat-val {
  width: 30px;
  text-align: right;
  font-weight: 700;
  color: #2c3e50;
}

.physical-stats {
  margin-top: 2rem;
  display: flex;
  gap: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  color: #2c3e50;
}

.notes-section {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.notes-section h3 {
  font-size: 1.2rem;
  margin: 0;
  color: #444;
}

.edit-note-btn {
  background: transparent;
  color: #667eea;
  border: 1px solid #667eea;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-note-btn:hover {
  background: #667eea;
  color: white;
}

.notes-content {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  color: #555;
  line-height: 1.5;
  white-space: pre-wrap;
  border-left: 3px solid #667eea;
}

.notes-empty {
  color: #999;
  font-style: italic;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.action-button {
  padding: 1rem 3rem;
  border: none;
  border-radius: 2rem;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s;
}

.action-button:hover {
  transform: scale(1.05);
}

.action-button.catch {
  background-color: #ff6b6b;
  color: white;
}

@media (max-width: 768px) {
  .content-split {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
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
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
  padding: 0 0.5rem;
}

.close-btn:hover {
  color: #333;
}

.link-container {
  margin: 1rem 0;
}

.link-input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #555;
  background-color: #f9f9f9;
  box-sizing: border-box;
}

.link-input:focus {
  outline: 2px solid #667eea;
  border-color: #667eea;
}

.feedback-area {
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.copied-badge {
  color: #4CAF50;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
