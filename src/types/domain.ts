export const POKEMON_TYPES = [
    'normal', 'fire', 'water', 'grass', 'electric',
    'ice', 'fighting', 'poison', 'ground', 'flying',
    'psychic', 'bug', 'rock', 'ghost', 'dragon',
    'steel', 'dark', 'fairy'
] as const;

export type PokemonType = (typeof POKEMON_TYPES)[number];

export interface PokemonStats {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
}

export interface Pokemon {
    id: number;
    name: string;
    imageUrl: string;
    types: PokemonType[];
    stats: PokemonStats;
    height: number;
    weight: number;
}

export interface CaughtPokemon extends Pokemon {
    caughtAt: number; // Timestamp
    notes?: string;
}
