import type { Pokemon, PokemonType } from '@/types/domain';

export type FilterOptions = {
    search?: string;
    type?: PokemonType | '';
};

export const pokemonFilters = {
    filter(list: Pokemon[], options: FilterOptions): Pokemon[] {
        let result = list;

        // Filter by Search (Name or ID)
        if (options.search) {
            const query = options.search.toLowerCase().trim();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.id.toString().includes(query)
            );
        }

        // Filter by Type
        if (options.type) {
            result = result.filter(p => p.types.includes(options.type as PokemonType));
        }

        return result;
    }
};
