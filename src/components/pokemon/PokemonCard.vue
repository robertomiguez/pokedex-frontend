<script setup lang="ts">
import { computed } from 'vue';
import type { Pokemon, CaughtPokemon } from '@/types/domain';

const props = defineProps<{
  pokemon: Pokemon | CaughtPokemon;
  isCaught?: boolean;
}>();

const emit = defineEmits<{
  (e: 'click'): void;
}>();

const typeColors: Record<string, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  grass: '#78C850',
  electric: '#F8D030',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  steel: '#B8B8D0',
  dark: '#705848',
  fairy: '#EE99AC',
};

const mainTypeColor = computed(() => {
  const type = props.pokemon.types[0];
  if (!type) return '#A8A878';
  return typeColors[type] || '#A8A878';
});

const cardBackground = computed(() => {
  return `linear-gradient(135deg, ${mainTypeColor.value}22 0%, ${mainTypeColor.value}44 100%)`;
});

function padId(id: number): string {
  return `#${id.toString().padStart(3, '0')}`;
}
</script>

<template>
  <div 
    class="pokemon-card" 
    @click="emit('click')" 
    :class="{ 'is-caught': isCaught }"
    :style="{ background: cardBackground }"
  >
    <div class="card-header">
      <span class="pokemon-id">{{ padId(pokemon.id) }}</span>
      <span v-if="isCaught" class="caught-icon" title="Caught">★</span>
    </div>
    
    <div class="image-container">
      <img :src="pokemon.imageUrl" :alt="pokemon.name" class="pokemon-image" loading="lazy" />
    </div>

    <div class="card-info">
      <h3 class="pokemon-name">{{ pokemon.name }}</h3>
      <div class="types">
        <span 
          v-for="type in pokemon.types" 
          :key="type" 
          class="type-badge"
          :style="{ backgroundColor: typeColors[type] }"
        >
          {{ type }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pokemon-card {
  border-radius: 1rem;
  padding: 1rem;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  border: 2px solid transparent;
  overflow: hidden;
}

.pokemon-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.is-caught {
  border-color: #FFD700;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.pokemon-id {
  font-family: monospace;
  font-weight: 700;
  opacity: 0.6;
}

.caught-icon {
  color: #FFD700;
  font-size: 1.2rem;
}

.image-container {
  display: flex;
  justify-content: center;
  margin: 0.5rem 0;
  height: 120px;
}

.pokemon-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.pokemon-card:hover .pokemon-image {
  transform: scale(1.1);
}

.pokemon-name {
  text-transform: capitalize;
  margin: 0.5rem 0;
  font-size: 1.2rem;
  text-align: center;
  font-weight: 600;
}

.types {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.type-badge {
  color: white;
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 1rem;
  text-transform: capitalize;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
</style>
