<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { usePokemonStore } from '@/stores/pokemon';
import PokemonGrid from '@/components/pokemon/PokemonGrid.vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { pokemonFilters } from '@/utils/pokemonFilters';
import { pokemonSorting, type SortField, type SortDirection } from '@/utils/pokemonSorting';
import type { PokemonType } from '@/types/domain';

const store = usePokemonStore();
const router = useRouter();
const { allPokemon, loading, error } = storeToRefs(store);
const { fetchAllPokemon, initialize } = store;

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

onMounted(async () => {
  await initialize();
  await fetchAllPokemon();
});

function handlePokemonClick(pokemon: any) {
  router.push({ name: 'pokemon-detail', params: { id: pokemon.id } });
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
    </div>

    <!-- Stats -->
    <div class="results-info" v-if="!loading && !error">
      Showing {{ filteredAndSortedPokemon.length }} Pokémon
    </div>

    <div v-if="loading && allPokemon.length === 0" class="loading-state">
      Loading Pokémon...
    </div>

    <div v-else-if="error" class="error-state">
      {{ error }}
      <button @click="fetchAllPokemon">Retry</button>
    </div>

    <div v-else>
      <PokemonGrid 
        :pokemon-list="filteredAndSortedPokemon" 
        @click="handlePokemonClick"
      />
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
</style>
