import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Pokemon, CaughtPokemon } from '@/types/domain';

export const usePokemonStore = defineStore('pokemon', () => {
    // State
    const allPokemon = ref<Pokemon[]>([]);
    const caughtPokemon = ref<CaughtPokemon[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    return {
        allPokemon,
        caughtPokemon,
        loading,
        error
    };
});
