<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notifications';
import { usePokemonStore } from '@/stores/pokemon';
import { storeToRefs } from 'pinia';
import type { CaughtPokemon } from '@/types/domain';

import NoteModal from '@/components/ui/NoteModal.vue';

const route = useRoute();
const router = useRouter();
const store = usePokemonStore();
const notificationStore = useNotificationStore();
const { allPokemon, loading, caughtPokemon } = storeToRefs(store);
const { initialize, fetchAllPokemon, catchPokemon, isCaught, updatePokemon } = store;

const pokemonId = computed(() => Number(route.params.id));

const pokemon = computed(() => {
  return allPokemon.value.find(p => p.id === pokemonId.value);
});

const isCaughtStatus = computed(() => isCaught(pokemonId.value));

const showNoteModal = ref(false);

// Get caught Pokemon data for date display & notes
const caughtData = computed(() => {
  if (!isCaughtStatus.value) return null;
  return caughtPokemon.value.find(p => p.id === pokemonId.value);
});

const caughtDateFormatted = computed(() => {
  if (!caughtData.value) return null;
  const date = new Date(caughtData.value.caughtAt);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
});

const currentNote = computed(() => {
    return caughtData.value?.notes || '';
});

const displayNote = computed(() => {
    const note = currentNote.value;
    if (note.length > 30) {
        return note.substring(0, 30) + '...';
    }
    return note;
});

onMounted(async () => {
  await initialize();
  if (allPokemon.value.length === 0) {
    await fetchAllPokemon();
  }
});

function handleAction() {
  if (!pokemon.value) return;
  // Safety check, though button is hidden if caught
  if (!isCaughtStatus.value) {
    catchPokemon(pokemon.value);
    notificationStore.addNotification({
        message: `You caught ${pokemon.value.name}!`,
        type: 'success',
        duration: 3000
    });
  }
}

function openNoteModal() {
    showNoteModal.value = true;
}

async function saveNote(note: string) {
    if (!pokemon.value || !isCaughtStatus.value) return;
    
    const caught = caughtPokemon.value.find(p => p.id === pokemon.value?.id);
    if (caught) {
        const updated: CaughtPokemon = { ...caught, notes: note };
        await updatePokemon(updated);
        notificationStore.addNotification({
            message: 'Note saved successfully!',
            type: 'success',
            duration: 3000
        });
    }
    showNoteModal.value = false;
}

function goBack() {
  router.back();
}

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
</script>

<template>
  <div class="pokemon-detail-wrapper">
    <div class="pokemon-detail-view" v-if="pokemon">
      <button class="back-button" @click="goBack">← Back</button>
      
      <div class="detail-card">
        <div class="header">
          <h1>{{ pokemon.name }}</h1>
          <span class="id">#{{ pokemon.id.toString().padStart(3, '0') }}</span>
        </div>

        <div class="caught-info" v-if="isCaughtStatus">
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

            <!-- Read-only Notes Section -->
            <div class="notes-section" v-if="isCaughtStatus">
              <div class="notes-header">
                <h3>Trainer Notes</h3>
                <button @click="openNoteModal" class="edit-note-btn">
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

        <div class="actions" v-if="!isCaughtStatus">
          <button 
            class="action-button catch" 
            @click="handleAction"
          >
            Catch!
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="loading" class="loading">
      Loading Pokémon Details...
    </div>
    
    <div v-else class="error">
      Pokémon not found.
      <button @click="goBack">Go Back</button>
    </div>

    <NoteModal
      :show="showNoteModal"
      :pokemon-name="pokemon?.name"
      :initial-note="currentNote"
      @save="saveNote"
      @close="showNoteModal = false"
    />
  </div>
</template>

<style scoped>
.pokemon-detail-view {
  max-width: 800px;
  margin: 0 auto;
}

.back-button {
  background: none;
  border: none;
  font-size: 1.1rem;
  color: #666;
  cursor: pointer;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
}

.detail-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
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

.action-button.release {
  background-color: #f1f3f5;
  color: #fa5252;
}

.loading, .error {
  text-align: center;
  padding: 4rem;
  font-size: 1.5rem;
  color: #666;
}

@media (max-width: 768px) {
  .content-split {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

</style>
