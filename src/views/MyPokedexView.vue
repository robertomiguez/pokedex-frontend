<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { usePokemonStore } from '@/stores/pokemon';
import { useNotificationStore } from '@/stores/notifications';
import PokemonCard from '@/components/pokemon/PokemonCard.vue';
import ConfirmationModal from '@/components/ui/ConfirmationModal.vue';
import NoteModal from '@/components/ui/NoteModal.vue';
import { storeToRefs } from 'pinia';
import { exportPokemonToCSV } from '@/utils/csvExport';
import { useRouter } from 'vue-router';

const store = usePokemonStore();
const router = useRouter();

const notificationStore = useNotificationStore();
const { caughtPokemon, caughtCount, progress } = storeToRefs(store);
const { initialize, releasePokemon, updatePokemon } = store;

// Single release state
const showConfirmModal = ref(false);

// Note state
const showNoteModal = ref(false);
const pokemonForNote = ref<{id: number, name: string, notes?: string} | null>(null);

// Bulk release state
const selectMode = ref(false);
const selectedIds = ref<Set<number>>(new Set());

// Context Menu State
const contextMenuVisible = ref(false);
const contextMenuPosition = ref({ x: 0, y: 0 });

const selectedCount = computed(() => selectedIds.value.size);

const contextMenuText = computed(() => {
    if (selectedCount.value > 1) {
        return `Release ${selectedCount.value} Pokémon`;
    }
    // If only 1 selected, find its name. 
    // If context menu was triggered on an item specifically, we could scope it, 
    // but our logic ensures single right-clicks select that item.
    if (selectedCount.value === 1) {
        const id = Array.from(selectedIds.value)[0];
        const p = caughtPokemon.value.find(p => p.id === id);
        if (p) return `Release ${p.name}`;
    }
    return 'Release';
});

// Helper to get currently selected single pokemon (for context menu)
const singleSelectedPokemon = computed(() => {
  if (selectedCount.value === 1) {
    const id = Array.from(selectedIds.value)[0];
    return caughtPokemon.value.find(p => p.id === id);
  }
  return null;
});

onMounted(async () => {
  await initialize();
  // Close context menu on any global click
  document.addEventListener('click', closeContextMenu);
});

onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu);
});


function toggleSelection(id: number) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id);
  } else {
    selectedIds.value.add(id);
  }
  // Force reactivity update
  selectedIds.value = new Set(selectedIds.value);
  selectMode.value = selectedIds.value.size > 0;
}

function handleCardClick(event: MouseEvent, id: number) {
  if (contextMenuVisible.value) {
    closeContextMenu();
  }

  if (event.ctrlKey || event.metaKey) {
    toggleSelection(id);
  } else {
    // Exclusive selection: Clear everything else, select ONLY this one
    selectedIds.value = new Set([id]);
    selectMode.value = true;
  }
}

function handleRightClick(event: MouseEvent, id: number) {
  // 1. Manage Selection
  if (!selectedIds.value.has(id)) {
      // If right-clicking unselected item, it becomes the only selection
      selectedIds.value.clear();
      selectedIds.value.add(id);
      selectedIds.value = new Set(selectedIds.value);
      selectMode.value = true;
  }
  
  // 2. Show Context Menu at mouse position
  contextMenuPosition.value = { x: event.clientX, y: event.clientY };
  contextMenuVisible.value = true;
}

function closeContextMenu() {
  contextMenuVisible.value = false;
}

function initiateViewDetail() {
    const p = singleSelectedPokemon.value;
    if (p) {
        router.push({ name: 'pokemon-info', params: { id: p.id } });
    }
    closeContextMenu();
}


function initiateRelease() {
  if (selectedCount.value > 0) {
    showConfirmModal.value = true;
  }
  closeContextMenu();
}

function initiateEditNote() {
    const p = singleSelectedPokemon.value;
    if (p) {
        pokemonForNote.value = {
            id: p.id,
            name: p.name,
            notes: p.notes
        };
        showNoteModal.value = true;
    }
    closeContextMenu();
}

async function saveNote(note: string) {
    if (pokemonForNote.value) {
        const id = pokemonForNote.value.id;
        const p = caughtPokemon.value.find(p => p.id === id);
        
        if (p) {
            // Update the object
            const updated = { ...p, notes: note };
            await updatePokemon(updated);
            
            notificationStore.addNotification({
                message: note ? `Note for ${p.name} saved successfully.` : `Note for ${p.name} removed.`,
                type: 'success',
                duration: 2000
            });
        }
    }
    showNoteModal.value = false;
    pokemonForNote.value = null;
}

function closeNoteModal() {
    showNoteModal.value = false;
    pokemonForNote.value = null;
}

function confirmRelease() {
  if (selectedCount.value > 0) {
    // Bulk release (logic works for single selection too)
    const count = selectedCount.value;
    selectedIds.value.forEach(id => releasePokemon(id));
    notificationStore.addNotification({
      message: `${count} Pokémon were released.`,
      type: 'info',
      duration: 3000
    });
    selectedIds.value.clear();
    selectMode.value = false;
  }
  showConfirmModal.value = false;
}

function cancelRelease() {
  showConfirmModal.value = false;
}

const confirmModalMessage = computed(() => {
  if (selectedCount.value === 1) {
      const id = Array.from(selectedIds.value)[0];
      const p = caughtPokemon.value.find(p => p.id === id);
      return `Are you sure you want to release ${p ? p.name : 'this Pokémon'}?`;
  }
  return `Are you sure you want to release ${selectedCount.value} Pokémon?`;
});
</script>

<template>
  <div class="my-pokedex-view">
    <div class="stats-bar" v-if="caughtCount > 0">
      <div class="stat-item">
        <span class="stat-label">Caught:</span>
        <span class="stat-value">{{ caughtCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Progress:</span>
        <span class="stat-value">{{ progress }}%</span>
      </div>
      <button @click="exportPokemonToCSV(caughtPokemon)" class="export-btn" title="Export Caught Pokemon to CSV">
        Export CSV
      </button>
    </div>

    <div v-if="caughtCount === 0" class="empty-state">
      <p>You haven't caught any Pokémon yet!</p>
      <router-link to="/" class="cta-button">Go Catch 'Em All!</router-link>
    </div>

    <div v-else class="pokemon-grid">
      <div 
        v-for="pokemon in caughtPokemon"
        :key="pokemon.id"
        class="card-wrapper"
        :class="{ 'selected': selectMode && selectedIds.has(pokemon.id) }"
        @contextmenu.prevent="handleRightClick($event, pokemon.id)"
      >
        <PokemonCard
          :pokemon="pokemon"
          :is-caught="true"
          @click="handleCardClick($event, pokemon.id)"
        />
        <!-- Note Indicator if note exists -->
        <div v-if="pokemon.notes" class="note-indicator" title="Has Notes">📝</div>
      </div>
    </div>

    <!-- Custom Context Menu -->
    <div 
      v-if="contextMenuVisible" 
      class="context-menu"
      :style="{ top: `${contextMenuPosition.y}px`, left: `${contextMenuPosition.x}px` }"
      @click.stop
    >
      <!-- Option for Detail (Only if single selection) -->
      <div 
        v-if="selectedCount === 1" 
        class="menu-item" 
        @click="initiateViewDetail"
      >
        <span class="icon">ℹ️</span> View Detail
      </div>

      <!-- Option for Note (Only if single selection) -->
      <div 
        v-if="selectedCount === 1" 
        class="menu-item" 
        @click="initiateEditNote"
      >
        <span class="icon">📝</span> Add/Edit Note
      </div>
      
      <div class="menu-divider" v-if="selectedCount === 1"></div>

      <div class="menu-item delete" @click="initiateRelease">
        <span class="icon">👋</span> {{ contextMenuText }}
      </div>
    </div>

    <ConfirmationModal
        :show="showConfirmModal"
        title="Release Pokémon"
        :message="confirmModalMessage"
        confirm-text="Release"
        type="danger"
        @confirm="confirmRelease"
        @cancel="cancelRelease"
    />

    <NoteModal
      :show="showNoteModal"
      :pokemon-name="pokemonForNote?.name"
      :initial-note="pokemonForNote?.notes"
      @save="saveNote"
      @close="closeNoteModal"
    />
  </div>
</template>

<style scoped>
.my-pokedex-view {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.stats-bar {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
  display: flex;
  gap: 2rem;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.export-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  height: 36px;
  box-sizing: border-box;
  margin-left: auto; /* Push to right if justified flex-start */
}

.export-btn:hover {
  background-color: #45a049;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2c3e50;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.empty-state p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.cta-button {
  display: inline-block;
  background-color: #ff6b6b;
  color: white;
  padding: 1rem 2rem;
  border-radius: 2rem;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s, background-color 0.2s;
}

.cta-button:hover {
  background-color: #fa5252;
  transform: translateY(-2px);
}

.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
}

.card-wrapper {
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 1rem; /* Match card radius for clean overlay */
  overflow: hidden;    /* Ensure overlay stays inside */
}

/* Light Bluish Overlay when selected */
.card-wrapper.selected::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(102, 126, 234, 0.4); /* Light bluish overlay */
  border: 2px solid #667eea;
  border-radius: 1rem;
  pointer-events: none; /* Allow clicks to pass through */
  z-index: 5;
}

.note-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  background: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 2;
  cursor: help;
}

/* Context Menu Styles */
.context-menu {
  position: fixed;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  padding: 0.5rem 0;
  z-index: 1000;
  min-width: 180px;
  border: 1px solid #eee;
}

.menu-item {
  padding: 0.8rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
  color: #2c3e50;
  font-weight: 500;
}

.menu-item:hover {
  background-color: #f8f9fa;
}

.menu-item.delete {
  color: #dc3545;
}

.menu-item .icon {
  font-size: 1.1rem;
  margin-right: 0.5rem;
}

.menu-divider {
  height: 1px;
  background-color: #eee;
  margin: 0.25rem 0;
}
</style>
