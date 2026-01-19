import type { PokemonGraphQLItem } from '@/types/api';
import type { Pokemon, PokemonType } from '@/types/domain';

/**
 * Maps GraphQL Pokemon response to domain Pokemon type
 * Issue #93: Bulk load all Pokemon via GraphQL
 */
export const pokemonGraphQLMapper = {
    toDomain(item: PokemonGraphQLItem): Pokemon {
        // Construct image URL from ID (GraphQL doesn't include sprites directly)
        const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`;

        return {
            id: item.id,
            name: item.name,
            imageUrl,
            types: item.pokemon_v2_pokemontypes.map(
                (t) => t.pokemon_v2_type.name as PokemonType
            ),
            stats: {
                hp: item.pokemon_v2_pokemonstats.find(s => s.pokemon_v2_stat.name === 'hp')?.base_stat || 0,
                attack: item.pokemon_v2_pokemonstats.find(s => s.pokemon_v2_stat.name === 'attack')?.base_stat || 0,
                defense: item.pokemon_v2_pokemonstats.find(s => s.pokemon_v2_stat.name === 'defense')?.base_stat || 0,
                specialAttack: item.pokemon_v2_pokemonstats.find(s => s.pokemon_v2_stat.name === 'special-attack')?.base_stat || 0,
                specialDefense: item.pokemon_v2_pokemonstats.find(s => s.pokemon_v2_stat.name === 'special-defense')?.base_stat || 0,
                speed: item.pokemon_v2_pokemonstats.find(s => s.pokemon_v2_stat.name === 'speed')?.base_stat || 0,
            },
            height: item.height,
            weight: item.weight,
        };
    },

    toDomainList(items: PokemonGraphQLItem[]): Pokemon[] {
        return items.map(this.toDomain);
    }
};
