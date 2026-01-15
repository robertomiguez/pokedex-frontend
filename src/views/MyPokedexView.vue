<script setup lang="ts">
import { onMounted } from 'vue';
import { usePokemonStore } from '@/stores/pokemon';
import PokemonCard from '@/components/pokemon/PokemonCard.vue';
import { storeToRefs } from 'pinia';

const store = usePokemonStore();
const { caughtPokemon, loading, error, caughtCount, totalCount, progress } = storeToRefs(store);
const { initialize, releasePokemon } = store;

onMounted(async () => {
  await initialize();
});

function handleRelease(id: number, name: string) {
  if (confirm(`Are you sure you want to release ${name}?`)) {
    releasePokemon(id);
  }
}
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
      <PokemonCard
        v-for="pokemon in caughtPokemon"
        :key="pokemon.id"
        :pokemon="pokemon"
        :is-caught="true"
        @click="handleRelease(pokemon.id, pokemon.name)"
      />
    </div>
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
</style>
