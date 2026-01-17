<script setup lang="ts">
import { usePokemonStore } from '@/stores/pokemon';
import PokemonCard from '@/components/pokemon/PokemonCard.vue';
import type { Pokemon } from '@/types/domain';

defineProps<{
  pokemonList: Pokemon[];
  selectedIds?: Set<number>;
}>();

const emit = defineEmits<{
  (e: 'click', event: MouseEvent, pokemon: Pokemon): void;
  (e: 'contextmenu', event: MouseEvent, pokemon: Pokemon): void;
}>();

const store = usePokemonStore();
const { isCaught } = store;
</script>

<template>
  <div class="pokemon-grid">
    <div 
      v-for="pokemon in pokemonList"
      :key="pokemon.id"
      class="card-wrapper"
      :class="{ 'selected': selectedIds?.has(pokemon.id) }"
    >
      <PokemonCard
        :pokemon="pokemon"
        :is-caught="isCaught(pokemon.id)"
        @click="emit('click', $event, pokemon)"
        @contextmenu.prevent="emit('contextmenu', $event, pokemon)"
      />
    </div>
  </div>
</template>

<style scoped>
.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
}

.card-wrapper {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
}

.card-wrapper.selected::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(102, 126, 234, 0.4); 
  border: 2px solid #667eea;
  border-radius: 1rem;
  pointer-events: none;
  z-index: 5;
}
</style>
