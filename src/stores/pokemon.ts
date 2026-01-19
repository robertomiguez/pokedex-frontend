import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Pokemon, CaughtPokemon } from '@/types/domain';
import { pokemonApi } from '@/services/api/pokemonApi';
import { pokemonGraphQLMapper } from '@/services/mappers/pokemonGraphQLMapper';
import { pokemonRepository } from '@/storage/repositories/pokemonRepository';
import { caughtPokemonRepository } from '@/storage/repositories/caughtPokemonRepository';

// Cache expiration: 24 hours in milliseconds
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000;
const CACHE_KEY = 'pokemon_cache_timestamp';

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

    const caughtIds = computed(() => new Set(caughtPokemon.value.map(p => p.id)));

    const isCaught = (id: number) => caughtIds.value.has(id);

    // Check if cache is expired
    function isCacheExpired(): boolean {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return true;

        const timestamp = parseInt(cached, 10);
        return Date.now() - timestamp > CACHE_EXPIRATION_MS;
    }

    // Update cache timestamp
    function updateCacheTimestamp(): void {
        localStorage.setItem(CACHE_KEY, Date.now().toString());
    }

    // Actions
    async function initialize() {
        if (initialized.value) return;
        try {
            // Load caught pokemon from storage
            caughtPokemon.value = await caughtPokemonRepository.getAll();

            // Load cached pokemon from storage (if not expired)
            if (!isCacheExpired()) {
                const cached = await pokemonRepository.getAll();
                if (cached.length > 0) {
                    allPokemon.value = cached;
                }
            }

            initialized.value = true;
        } catch (e) {
            console.error('Failed to initialize store:', e);
            error.value = 'Failed to load local data.';
        }
    }

    async function fetchAllPokemon(force = false) {
        if (loading.value) return;

        // Skip if we have data and not forcing refresh
        if (allPokemon.value.length > 0 && !force) return;

        loading.value = true;
        error.value = null;

        try {
            // Issue #93: Use GraphQL for bulk fetch (1 request instead of 1000+)
            const graphqlResponse = await pokemonApi.fetchAllPokemonGraphQL();

            // Map to Domain
            const mapped = pokemonGraphQLMapper.toDomainList(graphqlResponse.data.pokemon_v2_pokemon);

            // Update State
            allPokemon.value = mapped;

            // Cache
            // Use deep clone to avoid Proxy issues with IDB
            const rawMapped = JSON.parse(JSON.stringify(mapped));
            await pokemonRepository.saveMany(rawMapped);

            // Update cache timestamp
            updateCacheTimestamp();

        } catch (e) {
            console.error('Failed to fetch pokemon:', e);
            error.value = 'Failed to fetch pokemon data.';
        } finally {
            loading.value = false;
        }
    }

    // Force refresh from API (clears cache and re-fetches)
    async function refreshPokemon() {
        localStorage.removeItem(CACHE_KEY);
        allPokemon.value = [];
        await fetchAllPokemon(true);
    }

    async function catchPokemon(pokemon: Pokemon) {
        try {
            // Deep clone to ensure no Proxies (nested or otherwise) are passed to IndexedDB
            const rawPokemon = JSON.parse(JSON.stringify(pokemon));

            const caught: CaughtPokemon = {
                ...rawPokemon,
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
            // Deep clone to ensure no Proxies are passed to IndexedDB
            const rawPokemon = JSON.parse(JSON.stringify(pokemon));
            await caughtPokemonRepository.save(rawPokemon);

            const index = caughtPokemon.value.findIndex(p => p.id === pokemon.id);
            if (index !== -1) {
                caughtPokemon.value[index] = rawPokemon;
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
        refreshPokemon,
        catchPokemon,
        releasePokemon,
        updatePokemon,
        caughtCount,
        totalCount,
        progress,
        isCaught
    };
});

