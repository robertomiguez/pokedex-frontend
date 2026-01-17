<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { usePokemonStore } from '@/stores/pokemon';
import { useNotificationStore } from '@/stores/notifications';
import PokemonCard from '@/components/pokemon/PokemonCard.vue';
import ConfirmationModal from '@/components/ui/ConfirmationModal.vue';
import { storeToRefs } from 'pinia';

const store = usePokemonStore();
const notificationStore = useNotificationStore();
const { caughtPokemon, caughtCount, progress } = storeToRefs(store);
const { initialize, releasePokemon } = store;

// Single release state
const showConfirmModal = ref(false);
const pokemonToRelease = ref<{id: number, name: string} | null>(null);

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

function handleCardClick(event: MouseEvent, id: number, name: string) {
  if (contextMenuVisible.value) {
    closeContextMenu();
  }

  if (event.ctrlKey || event.metaKey) {
    toggleSelection(id);
  } else {
    if (selectMode.value) {
        // In select mode, clicking usually selects/deselects or resets selection
        // Standard behavior: Click without Ctrl clears other selections and selects this one
        selectedIds.value.clear();
        selectedIds.value.add(id);
        selectedIds.value = new Set(selectedIds.value);
    } else {
      // Single release flow - keeps existing behavior for normal clicks
      pokemonToRelease.value = { id, name };
      showConfirmModal.value = true;
    }
    selectMode.value = selectedIds.value.size > 0;
  }
}

function handleRightClick(event: MouseEvent, id: number, name: string) {
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

function initiateRelease() {
  if (selectedCount.value > 0) {
    showConfirmModal.value = true;
  }
  closeContextMenu();
}

function confirmRelease() {
  if (selectMode.value && selectedCount.value > 0) {
    // Bulk release
    const count = selectedCount.value;
    selectedIds.value.forEach(id => releasePokemon(id));
    notificationStore.addNotification({
      message: `${count} Pokémon were released.`,
      type: 'info',
      duration: 3000
    });
    selectedIds.value.clear();
    selectMode.value = false;
  } else if (pokemonToRelease.value) {
    // Single release via normal click
    releasePokemon(pokemonToRelease.value.id);
    notificationStore.addNotification({
      message: `${pokemonToRelease.value.name} was released.`,
      type: 'info',
      duration: 3000
    });
    pokemonToRelease.value = null;
  }
  showConfirmModal.value = false;
}

function cancelRelease() {
  showConfirmModal.value = false;
  pokemonToRelease.value = null;
}

const confirmModalMessage = computed(() => {
  if (selectMode.value && selectedCount.value > 0) {
    if (selectedCount.value === 1) {
       // Try to get name for nicer message
       const id = Array.from(selectedIds.value)[0];
       const p = caughtPokemon.value.find(p => p.id === id);
       return `Are you sure you want to release ${p ? p.name : 'this Pokémon'}?`;
    }
    return `Are you sure you want to release ${selectedCount.value} Pokémon?`;
  }
  return `Are you sure you want to release ${pokemonToRelease.value?.name}?`;
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
        @contextmenu.prevent="handleRightClick($event, pokemon.id, pokemon.name)"
      >
        <PokemonCard
          :pokemon="pokemon"
          :is-caught="true"
          @click="handleCardClick($event, pokemon.id, pokemon.name)"
        />
      </div>
    </div>

    <!-- Custom Context Menu -->
    <div 
      v-if="contextMenuVisible" 
      class="context-menu"
      :style="{ top: `${contextMenuPosition.y}px`, left: `${contextMenuPosition.x}px` }"
      @click.stop
    >
      <div class="menu-item delete" @click="initiateRelease">
        <span class="icon">�</span> {{ contextMenuText }}
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
  </div>
</template>

<style scoped>
.my-pokedex-view {
  width: 100%;
}

.stats-bar {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
  display: flex;
  gap: 2rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
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
</style>
