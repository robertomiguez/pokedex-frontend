<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { usePokemonStore } from '@/stores/pokemon';
import PokemonGrid from '@/components/pokemon/PokemonGrid.vue';
import PokemonList from '@/components/pokemon/PokemonList.vue';
import PokemonTable from '@/components/pokemon/PokemonTable.vue';
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { pokemonFilters } from '@/utils/pokemonFilters';
import { pokemonSorting, type SortField, type SortDirection } from '@/utils/pokemonSorting';
import type { PokemonType, Pokemon } from '@/types/domain';
import { exportPokemonToCSV } from '@/utils/csvExport';
import { useNotificationStore } from '@/stores/notifications';

const store = usePokemonStore();
const router = useRouter();
const notificationStore = useNotificationStore();
const { allPokemon, loading, error } = storeToRefs(store);
const { fetchAllPokemon, initialize, catchPokemon, releasePokemon, isCaught } = store;

// View Mode State
type ViewMode = 'grid' | 'list' | 'table';
const viewMode = ref<ViewMode>((localStorage.getItem('pokedex-view-mode') as ViewMode) || 'grid');

function setViewMode(mode: ViewMode) {
  viewMode.value = mode;
  localStorage.setItem('pokedex-view-mode', mode);
}

// Filter & Sort State
const searchQuery = ref('');
const selectedType = ref<PokemonType | ''>('');
const sortField = ref<SortField>('id');
const sortDirection = ref<SortDirection>('asc');

const pokemonTypes: PokemonType[] = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison',
  'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'steel',
  'dark', 'fairy'
];

// Computed List
const filteredAndSortedPokemon = computed(() => {
  let result = pokemonFilters.filter(allPokemon.value, {
    search: searchQuery.value,
    type: selectedType.value
  });

  result = pokemonSorting.sort(result, {
    field: sortField.value,
    direction: sortDirection.value
  });

  return result;
});

// Selection & Bulk Catch State
const selectedIds = ref<Set<number>>(new Set());
const contextMenuVisible = ref(false);
const contextMenuPosition = ref({ x: 0, y: 0 });

const selectedCount = computed(() => selectedIds.value.size);

// Simplified: We only care if we have selected items, which by definition must be uncaught
const hasSelection = computed(() => selectedCount.value > 0);

const contextMenuText = computed(() => {
    if (selectedCount.value === 1) {
        const id = Array.from(selectedIds.value)[0];
        const p = allPokemon.value.find(p => p.id === id);
        if (!p) return '';
        // Always "Catch" because we can't select caught ones
        return `Catch ${p.name}`;
    }
    
    if (selectedCount.value > 1) {
        return `Catch ${selectedCount.value} Pokemon`;
    }
    
    return '';
});

onMounted(async () => {
  await initialize();
  await fetchAllPokemon();
  document.addEventListener('click', closeContextMenu);
});

onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu);
});

function handlePokemonClick(_event: MouseEvent | any, pokemon: Pokemon) {
  if (contextMenuVisible.value) closeContextMenu();

  // Prevent selecting caught pokemon
  if (isCaught(pokemon.id)) return;

  // Pure Selection Logic - Toggle
  if (selectedIds.value.has(pokemon.id)) {
      selectedIds.value.delete(pokemon.id);
  } else {
      selectedIds.value.add(pokemon.id);
  }
  selectedIds.value = new Set(selectedIds.value); // Trigger reactivity
}

function handleRightClick(event: MouseEvent, pokemon: Pokemon) {
    // Prevent context menu for caught pokemon
    if (isCaught(pokemon.id)) return;

    if (!selectedIds.value.has(pokemon.id)) {
        selectedIds.value.clear();
        selectedIds.value.add(pokemon.id);
        selectedIds.value = new Set(selectedIds.value);
    }
    contextMenuPosition.value = { x: event.clientX, y: event.clientY };
    contextMenuVisible.value = true;
}

function closeContextMenu() {
    contextMenuVisible.value = false;
}

async function handleContextAction() {
    const ids = Array.from(selectedIds.value);
    
    // Single Pokemon Logic -> Navigate to Detail (User wants "Catch" button in detail)
    if (ids.length === 1) {
        const id = ids[0];
        // Just navigate
        router.push({ name: 'pokemon-detail', params: { id } });
    } 
    // Bulk Logic -> Catch Immediately
    else if (ids.length > 1) {
        let count = 0;
        for (const id of ids) {
            const p = allPokemon.value.find(poke => poke.id === id);
            if (p && !isCaught(id)) {
                await catchPokemon(p);
                count++;
            }
        }
        notificationStore.addNotification({ 
            message: `Captured ${count} Pokemon!`, 
            type: 'success', 
            duration: 3000 
        });
    }

    selectedIds.value.clear();
    closeContextMenu();
} 
</script>

<template>
  <div class="all-pokemon-view">
    <!-- Filter & Sort Controls -->
    <div class="controls-bar" v-if="!loading && !error && allPokemon.length > 0">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search by name or ID..."
        />
      </div>
      
      <div class="filter-group">
        <select v-model="selectedType">
          <option value="">All Types</option>
          <option v-for="type in pokemonTypes" :key="type" :value="type">
            {{ type.charAt(0).toUpperCase() + type.slice(1) }}
          </option>
        </select>

        <select v-model="sortField">
          <option value="id">Sort by ID</option>
          <option value="name">Sort by Name</option>
        </select>

        <select v-model="sortDirection">
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      <div class="view-mode-group">
        <button 
          @click="setViewMode('grid')" 
          :class="{ active: viewMode === 'grid' }"
          title="Grid View"
        >
          Grid
        </button>
        <button 
          @click="setViewMode('list')" 
          :class="{ active: viewMode === 'list' }"
          title="List View"
        >
          List
        </button>
        <button 
          @click="setViewMode('table')" 
          :class="{ active: viewMode === 'table' }"
          title="Table View"
        >
          Table
        </button>
      </div>

      <button @click="exportPokemonToCSV(filteredAndSortedPokemon)" class="export-btn">
        Export CSV
      </button>
    </div>

    <!-- Stats -->
    <div class="results-info" v-if="!loading && !error">
      Showing {{ filteredAndSortedPokemon.length }} Pokémon
    </div>

    <div v-if="loading && allPokemon.length === 0" class="loading-grid">
      <div v-for="n in 12" :key="n" class="skeleton-card">
         <SkeletonLoader height="150px" border-radius="12px" />
         <div class="skeleton-text">
           <SkeletonLoader width="60%" height="20px" />
           <SkeletonLoader width="40%" height="15px" />
         </div>
      </div>
    </div>

    <div v-else-if="error" class="error-state">
      {{ error }}
      <button @click="fetchAllPokemon">Retry</button>
    </div>

    <div v-else>
      <PokemonGrid 
        v-if="viewMode === 'grid' || !['list', 'table'].includes(viewMode)"
        :pokemon-list="filteredAndSortedPokemon" 
        :selected-ids="selectedIds"
        @click="handlePokemonClick"
        @contextmenu="handleRightClick"
      />
      <PokemonList 
        v-else-if="viewMode === 'list'"
        :pokemon-list="filteredAndSortedPokemon" 
        :selected-ids="selectedIds"
        @click="handlePokemonClick"
        @contextmenu="handleRightClick"
      />
      <!-- PokemonTable not supporting selection/context yet, default click behavior there might just pass pokemon -->
      <PokemonTable 
        v-else-if="viewMode === 'table'"
        :pokemon-list="filteredAndSortedPokemon" 
        @click="(p) => handlePokemonClick(null, p)" 
      />
    </div>

    <!-- Context Menu -->
    <div 
      v-if="contextMenuVisible" 
      class="context-menu" 
      :style="{ top: `${contextMenuPosition.y}px`, left: `${contextMenuPosition.x}px` }"
      @click.stop
    >
      <div 
        class="menu-item catch" 
        @click="handleContextAction"
      >
         <span class="icon">🔴</span> 
         {{ contextMenuText }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.all-pokemon-view {
  width: 100%;
}

.controls-bar {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
  align-items: center;
}

.search-box input {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 250px;
  font-size: 1rem;
}

.filter-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-group select {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 1rem;
  cursor: pointer;
}

.view-mode-group {
  display: flex;
  gap: 0.5rem;
}

.view-mode-group button {
  margin: 0;
  padding: 0.5rem 0.8rem;
  background-color: white;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.view-mode-group button.active {
  background-color: #f0f0f0;
  color: #333;
  border-color: #bbb;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
}

.export-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  margin: 0;
  cursor: pointer;
}

.export-btn:hover {
  background-color: #45a049;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.skeleton-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-text {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: center;
}

.results-info {
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
}

.error-state {
  color: #ff6b6b;
}

button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
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

.menu-item.catch {
  color: #ff6b6b;
}

.menu-item.release {
  color: #6c757d;
}

.menu-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.menu-item .icon {
  font-size: 1.1rem;
  margin-right: 0.5rem;
}
</style>
