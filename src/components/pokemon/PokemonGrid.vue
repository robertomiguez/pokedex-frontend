<script setup lang="ts">
import { usePokemonStore } from '@/stores/pokemon';
import PokemonCard from '@/components/pokemon/PokemonCard.vue';
import type { Pokemon } from '@/types/domain';

defineProps<{
  pokemonList: Pokemon[];
}>();

const emit = defineEmits<{
  (e: 'click', pokemon: Pokemon): void;
}>();

const store = usePokemonStore();
const { isCaught } = store;
</script>

<template>
  <div class="pokemon-grid">
    <PokemonCard
      v-for="pokemon in pokemonList"
      :key="pokemon.id"
      :pokemon="pokemon"
      :is-caught="isCaught(pokemon.id)"
      @click="emit('click', pokemon)"
    />
  </div>
</template>

<style scoped>
.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
}
</style>
