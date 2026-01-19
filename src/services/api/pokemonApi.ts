import type { PokemonListResponse, PokemonDetailResponse, PokemonGraphQLResponse } from '@/types/api';

const BASE_URL = 'https://pokeapi.co/api/v2';
const GRAPHQL_URL = 'https://beta.pokeapi.co/graphql/v1beta';

const POKEMON_QUERY = `
query GetAllPokemon {
  pokemon_v2_pokemon {
    id
    name
    height
    weight
    pokemon_v2_pokemontypes {
      pokemon_v2_type {
        name
      }
    }
    pokemon_v2_pokemonstats {
      base_stat
      pokemon_v2_stat {
        name
      }
    }
  }
}
`;

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
    },

    async fetchAllPokemonGraphQL(): Promise<PokemonGraphQLResponse> {
        try {
            const response = await fetch(GRAPHQL_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: POKEMON_QUERY }),
            });
            if (!response.ok) {
                throw new Error(`GraphQL Error: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch pokemon via GraphQL:', error);
            throw error;
        }
    }
};
