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
