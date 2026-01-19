<script setup lang="ts">
import { computed, ref } from 'vue';
import { useVirtualizer } from '@tanstack/vue-virtual';
import { usePokemonStore } from '@/stores/pokemon';
import type { Pokemon } from '@/types/domain';

const props = defineProps<{
  pokemonList: Pokemon[];
}>();

const emit = defineEmits<{
  (e: 'click', pokemon: Pokemon): void;
  (e: 'contextmenu', event: MouseEvent, pokemon: Pokemon): void;
}>();

const store = usePokemonStore();
const { isCaught } = store;

const parentRef = ref<HTMLElement | null>(null);

const virtualizerOptions = computed(() => ({
  count: props.pokemonList.length,
  getScrollElement: () => parentRef.value,
  estimateSize: () => 60,
  overscan: 5,
}));

const virtualizer = useVirtualizer(virtualizerOptions);

const items = computed(() => virtualizer.value.getVirtualItems());

const totalSize = computed(() => virtualizer.value.getTotalSize());

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
  <div class="pokemon-table-container" ref="parentRef">
    <div :style="{ height: `${totalSize}px`, width: '100%', position: 'relative' }">
      <table class="pokemon-table">
        <thead>
          <!-- Header is sticky but outside the virtual container effectively, 
               or we simulate it. For simple virtualization, we might put header outside parentRef 
               or handle it differently. Here, rows are virtualized absolute positioned usually 
               OR we use the transform method. TanStack Virtual usually suggests absolute positioning for rows.
               But for a table, we need a specific structure. 
               
               Let's stick to a div-based table structure for easier virtualization 
               OR just virtualize the tbody rows if possible (tricky with styles).
               
               For simplicity/robustness with TanStack Virtual in Vue, divs are often safest.
               Let's try a div-based table (accessible).
          -->
        </thead>
        <tbody>
           <!-- We will use div structure below for easier virtualization control -->
        </tbody>
      </table>
      
      <div 
        v-for="virtualRow in items"
        :key="`${virtualRow.key}`"
        class="table-row"
        :class="{ 'is-caught': props.pokemonList[virtualRow.index] && isCaught(props.pokemonList[virtualRow.index]!.id) }"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${virtualRow.size}px`,
          transform: `translateY(${virtualRow.start}px)`,
        }"
      >
        <template v-if="props.pokemonList[virtualRow.index]">
            <div class="col-id" 
              @click="emit('click', props.pokemonList[virtualRow.index]!)"
              @contextmenu.prevent="emit('contextmenu', $event, props.pokemonList[virtualRow.index]!)"
            >{{ padId(props.pokemonList[virtualRow.index]!.id) }}</div>
            <div class="col-image" 
              @click="emit('click', props.pokemonList[virtualRow.index]!)"
              @contextmenu.prevent="emit('contextmenu', $event, props.pokemonList[virtualRow.index]!)"
            >
            <img :src="props.pokemonList[virtualRow.index]!.imageUrl" alt="" loading="lazy"/>
            </div>
            <div class="col-name" 
              @click="emit('click', props.pokemonList[virtualRow.index]!)"
              @contextmenu.prevent="emit('contextmenu', $event, props.pokemonList[virtualRow.index]!)"
            >{{ props.pokemonList[virtualRow.index]!.name }}</div>
            <div class="col-types" 
              @click="emit('click', props.pokemonList[virtualRow.index]!)"
              @contextmenu.prevent="emit('contextmenu', $event, props.pokemonList[virtualRow.index]!)"
            >
            <span 
                v-for="type in props.pokemonList[virtualRow.index]!.types" 
                :key="type"
                class="type-badge"
                :style="{ backgroundColor: typeColors[type] }"
            >
                {{ type }}
            </span>
            </div>
            <div class="col-caught" 
              @click="emit('click', props.pokemonList[virtualRow.index]!)"
              @contextmenu.prevent="emit('contextmenu', $event, props.pokemonList[virtualRow.index]!)"
            >
            <span v-if="isCaught(props.pokemonList[virtualRow.index]!.id)">★</span>
            </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pokemon-table-container {
  height: 600px; /* Constraints needed for virtualization */
  width: 100%;
  overflow-y: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  position: relative;
}

.table-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.1s;
  padding: 0 1rem;
  box-sizing: border-box;
  /* Prevent mobile browser context menu */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  touch-action: manipulation;
}

.table-row:hover {
  background-color: #f9f9f9;
}

.col-id { width: 80px; font-family: monospace; color: #999; font-weight: 700; }
.col-image { width: 60px; display: flex; justify-content: center; }
.col-image img { width: 40px; height: 40px; object-fit: contain; }
.col-name { flex: 1; text-transform: capitalize; font-weight: 600; font-size: 1.1rem; }
.col-types { width: 200px; display: flex; gap: 0.5rem; }
.col-caught { width: 50px; text-align: center; color: #FFD700; font-size: 1.2rem; }

.type-badge {
  color: white;
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 1rem;
  text-transform: capitalize;
}

/* Grey out caught Pokemon */
.table-row.is-caught {
  background-color: #f0f0f0 !important;
  cursor: default;
}

.table-row.is-caught:hover {
  background-color: #f0f0f0 !important;
}

.table-row.is-caught .col-id,
.table-row.is-caught .col-name,
.table-row.is-caught .col-image img {
  filter: grayscale(1);
  opacity: 0.5;
}
</style>
