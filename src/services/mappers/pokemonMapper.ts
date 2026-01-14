import type { PokemonDetailResponse } from '@/types/api';
import type { Pokemon, PokemonType } from '@/types/domain';

export const pokemonMapper = {
    toDomain(apiResponse: PokemonDetailResponse): Pokemon {
        return {
            id: apiResponse.id,
            name: apiResponse.name,
            imageUrl:
                apiResponse.sprites.other?.['official-artwork']?.front_default ||
                apiResponse.sprites.front_default,
            types: apiResponse.types.map((t) => t.type.name as PokemonType),
            stats: {
                hp: apiResponse.stats.find(s => s.stat.name === 'hp')?.base_stat || 0,
                attack: apiResponse.stats.find(s => s.stat.name === 'attack')?.base_stat || 0,
                defense: apiResponse.stats.find(s => s.stat.name === 'defense')?.base_stat || 0,
                specialAttack: apiResponse.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 0,
                specialDefense: apiResponse.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 0,
                speed: apiResponse.stats.find(s => s.stat.name === 'speed')?.base_stat || 0,
            },
            height: apiResponse.height,
            weight: apiResponse.weight,
        };
    }
};
