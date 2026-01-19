<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePokemonStore } from '@/stores/pokemon';
import { storeToRefs } from 'pinia';

import PokemonDetailCard from '@/components/pokemon/PokemonDetailCard.vue';

const route = useRoute();
const router = useRouter();
const store = usePokemonStore();
const { allPokemon, loading, caughtPokemon } = storeToRefs(store);
const { initialize, fetchAllPokemon, isCaught } = store;

const pokemonId = computed(() => Number(route.params.id));

const pokemon = computed(() => {
  return allPokemon.value.find(p => p.id === pokemonId.value);
});

const isCaughtStatus = computed(() => isCaught(pokemonId.value));

// Get caught Pokemon data for date display
const caughtData = computed(() => {
  if (!isCaughtStatus.value) return null;
  return caughtPokemon.value.find(p => p.id === pokemonId.value);
});

onMounted(async () => {
  await initialize();
  if (allPokemon.value.length === 0) {
    await fetchAllPokemon();
  }
});

function goBack() {
  router.back();
}
</script>

<template>
  <div class="pokemon-detail-wrapper">
    <div class="pokemon-detail-view" v-if="pokemon">
      <button class="back-button" @click="goBack">← Back</button>
      
      <PokemonDetailCard
        :pokemon="pokemon"
        :is-caught="isCaughtStatus"
        :caught-data="caughtData"
        :show-actions="false"
        :show-notes="false"
      />
    </div>

    <div v-else-if="loading" class="loading">
      Loading Pokémon Details...
    </div>
    
    <div v-else class="error">
      Pokémon not found.
      <button @click="goBack">Go Back</button>
    </div>
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

.loading, .error {
  text-align: center;
  padding: 4rem;
  font-size: 1.5rem;
  color: #666;
}
</style>
