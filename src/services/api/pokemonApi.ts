import type { PokemonListResponse, PokemonDetailResponse } from '@/types/api';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const pokemonApi = {
    async fetchPokemonList(offset = 0, limit = 20): Promise<PokemonListResponse> {
        try {
            const response = await fetch(`${BASE_URL}/pokemon?offset=${offset}&limit=${limit}`);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch pokemon list:', error);
            throw error;
        }
    },

    async fetchPokemonById(id: number): Promise<PokemonDetailResponse> {
        try {
            const response = await fetch(`${BASE_URL}/pokemon/${id}`);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Failed to fetch pokemon details for id ${id}:`, error);
            throw error;
        }
    }
};
