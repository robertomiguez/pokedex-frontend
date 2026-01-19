export interface PokemonListResult {
    name: string;
    url: string;
}

export interface PokemonListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: PokemonListResult[];
}

export interface PokemonTypeResponse {
    slot: number;
    type: {
        name: string;
        url: string;
    };
}

export interface PokemonStatResponse {
    base_stat: number;
    effort: number;
    stat: {
        name: string;
        url: string;
    };
}

export interface PokemonDetailResponse {
    id: number;
    name: string;
    height: number;
    weight: number;
    sprites: {
        front_default: string;
        // Add other sprites if needed
        other?: {
            'official-artwork'?: {
                front_default: string;
            };
        };
    };
    types: PokemonTypeResponse[];
    stats: PokemonStatResponse[];
}

// GraphQL Types (Issue #93)
export interface PokemonGraphQLType {
    pokemon_v2_type: {
        name: string;
    };
}

export interface PokemonGraphQLStat {
    base_stat: number;
    pokemon_v2_stat: {
        name: string;
    };
}

export interface PokemonGraphQLItem {
    id: number;
    name: string;
    height: number;
    weight: number;
    pokemon_v2_pokemontypes: PokemonGraphQLType[];
    pokemon_v2_pokemonstats: PokemonGraphQLStat[];
}

export interface PokemonGraphQLResponse {
    data: {
        pokemon_v2_pokemon: PokemonGraphQLItem[];
    };
}
