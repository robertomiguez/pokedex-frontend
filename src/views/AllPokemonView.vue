<script setup lang="ts">
import { onMounted } from 'vue';
import { usePokemonStore } from '@/stores/pokemon';
import PokemonCard from '@/components/pokemon/PokemonCard.vue';
import { storeToRefs } from 'pinia';

const store = usePokemonStore();
const { allPokemon, loading, error } = storeToRefs(store);
const { fetchAllPokemon, initialize, catchPokemon, isCaught } = store;

onMounted(async () => {
  await initialize();
  await fetchAllPokemon();
});

function handlePokemonClick(pokemon: any) {
  // Logic to navigate to details or catch (for now just console log or catch)
  // For this step, let's just log. In next steps we add Detail View.
  console.log('Clicked:', pokemon.name);
  if (!isCaught(pokemon.id).value) {
    catchPokemon(pokemon);
  }
}
</script>

<template>
  <div class="all-pokemon-view">
    <div v-if="loading && allPokemon.length === 0" class="loading-state">
      Loading Pokémon...
    </div>

    <div v-else-if="error" class="error-state">
      {{ error }}
      <button @click="fetchAllPokemon">Retry</button>
    </div>

    <div v-else class="pokemon-grid">
      <PokemonCard
        v-for="pokemon in allPokemon"
        :key="pokemon.id"
        :pokemon="pokemon"
        :is-caught="isCaught(pokemon.id).value"
        @click="handlePokemonClick(pokemon)"
      />
    </div>
  </div>
</template>

<style scoped>
.all-pokemon-view {
  width: 100%;
}

.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
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
