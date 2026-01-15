import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Pokemon, CaughtPokemon } from '@/types/domain';
import { pokemonApi } from '@/services/api/pokemonApi';
import { pokemonMapper } from '@/services/mappers/pokemonMapper';
import { pokemonRepository } from '@/storage/repositories/pokemonRepository';
import { caughtPokemonRepository } from '@/storage/repositories/caughtPokemonRepository';

export const usePokemonStore = defineStore('pokemon', () => {
    // State
    const allPokemon = ref<Pokemon[]>([]);
    const caughtPokemon = ref<CaughtPokemon[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const initialized = ref(false);

    // Getters
    const caughtCount = computed(() => caughtPokemon.value.length);
    const totalCount = computed(() => allPokemon.value.length);
    const progress = computed(() => {
        if (totalCount.value === 0) return 0;
        return Math.round((caughtCount.value / totalCount.value) * 100);
    });

    const isCaught = (id: number) => computed(() =>
        caughtPokemon.value.some(p => p.id === id)
    );

    // Actions
    async function initialize() {
        if (initialized.value) return;
        try {
            // Load caught pokemon from storage
            caughtPokemon.value = await caughtPokemonRepository.getAll();

            // Load cached pokemon from storage
            const cached = await pokemonRepository.getAll();
            if (cached.length > 0) {
                allPokemon.value = cached;
            }

            initialized.value = true;
        } catch (e) {
            console.error('Failed to initialize store:', e);
            error.value = 'Failed to load local data.';
        }
    }

    async function fetchAllPokemon() {
        if (loading.value) return;

        // If we already have data (from cache in initialize), mostly good. 
        // But if cache was empty, we need to fetch.
        if (allPokemon.value.length > 0) return;

        loading.value = true;
        error.value = null;

        try {
            // 1. Fetch List (Gen 1 for now: 151)
            const listResp = await pokemonApi.fetchPokemonList(0, 151);

            // 2. Fetch Details for each
            // We process in chunks or parallel. For 151, Promise.all might be okay but heavy.
            // Let's do parallel requests.
            const detailPromises = listResp.results.map(async (item) => {
                // Extract ID from URL or just use index+1 since we know it's 1-151
                const parts = item.url.split('/');
                const id = parseInt(parts[parts.length - 2]);
                return pokemonApi.fetchPokemonById(id);
            });

            const details = await Promise.all(detailPromises);

            // 3. Map to Domain
            const mapped = details.map(pokemonMapper.toDomain);

            // 4. Update State
            allPokemon.value = mapped;

            // 5. Cache
            await pokemonRepository.saveMany(mapped);

        } catch (e) {
            console.error('Failed to fetch pokemon:', e);
            error.value = 'Failed to fetch pokemon data.';
        } finally {
            loading.value = false;
        }
    }

    async function catchPokemon(pokemon: Pokemon) {
        try {
            const caught: CaughtPokemon = {
                ...pokemon,
                caughtAt: Date.now(),
            };

            await caughtPokemonRepository.save(caught);
            caughtPokemon.value.push(caught);
        } catch (e) {
            console.error('Failed to catch pokemon:', e);
            error.value = 'Failed to save catch.';
        }
    }

    async function releasePokemon(id: number) {
        try {
            await caughtPokemonRepository.remove(id);
            caughtPokemon.value = caughtPokemon.value.filter(p => p.id !== id);
        } catch (e) {
            console.error('Failed to release pokemon:', e);
            error.value = 'Failed to release pokemon.';
        }
    }

    async function updatePokemon(pokemon: CaughtPokemon) {
        try {
            await caughtPokemonRepository.save(pokemon);
            const index = caughtPokemon.value.findIndex(p => p.id === pokemon.id);
            if (index !== -1) {
                caughtPokemon.value[index] = pokemon;
            }
        } catch (e) {
            console.error('Failed to update pokemon:', e);
            error.value = 'Failed to update pokemon.';
        }
    }

    return {
        allPokemon,
        caughtPokemon,
        loading,
        error,
        initialized,
        initialize,
        fetchAllPokemon,
        catchPokemon,
        releasePokemon,
        updatePokemon,
        caughtCount,
        totalCount,
        progress,
        isCaught
    };
});
