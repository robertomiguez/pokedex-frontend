<script setup lang="ts">
import { usePokemonStore } from '@/stores/pokemon';
import type { Pokemon } from '@/types/domain';

defineProps<{
  pokemonList: Pokemon[];
}>();

const emit = defineEmits<{
  (e: 'click', pokemon: Pokemon): void;
}>();

const store = usePokemonStore();
const { isCaught } = store;

const typeColors: Record<string, string> = {
  normal: '#A8A878', fire: '#F08030', water: '#6890F0', grass: '#78C850',
  electric: '#F8D030', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
  ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
  rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', steel: '#B8B8D0',
  dark: '#705848', fairy: '#EE99AC',
};

function padId(id: number): string {
  return `#${id.toString().padStart(3, '0')}`;
}
</script>

<template>
  <div class="pokemon-list">
    <div 
      v-for="pokemon in pokemonList"
      :key="pokemon.id"
      class="pokemon-list-item"
      @click="emit('click', pokemon)"
    >
      <div class="item-left">
        <img :src="pokemon.imageUrl" :alt="pokemon.name" loading="lazy" />
        <div class="item-info">
          <span class="pokemon-id">{{ padId(pokemon.id) }}</span>
          <span class="pokemon-name">{{ pokemon.name }}</span>
        </div>
      </div>
      
      <div class="item-right">
        <div class="types">
          <span 
            v-for="type in pokemon.types" 
            :key="type"
            class="type-dot"
            :style="{ backgroundColor: typeColors[type] }"
            :title="type"
          ></span>
        </div>
        <span v-if="isCaught(pokemon.id).value" class="caught-icon">★</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pokemon-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.pokemon-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
}

.pokemon-list-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.08);
}

.item-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.item-left img {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.item-info {
  display: flex;
  flex-direction: column;
}

.pokemon-id {
  font-size: 0.8rem;
  color: #999;
  font-weight: 700;
  font-family: monospace;
}

.pokemon-name {
  font-weight: 600;
  text-transform: capitalize;
  font-size: 1.1rem;
  color: #333;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.types {
  display: flex;
  gap: 4px;
}

.type-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.caught-icon {
  color: #FFD700;
  font-size: 1.2rem;
}
</style>
