import type { Pokemon } from '@/types/domain';

export type SortField = 'id' | 'name';
export type SortDirection = 'asc' | 'desc';

export type SortOptions = {
    field: SortField;
    direction: SortDirection;
};

export const pokemonSorting = {
    sort(list: Pokemon[], options: SortOptions): Pokemon[] {
        const { field, direction } = options;
        const multiplier = direction === 'asc' ? 1 : -1;

        return [...list].sort((a, b) => {
            if (field === 'name') {
                return a.name.localeCompare(b.name) * multiplier;
            }
            if (field === 'id') {
                return (a.id - b.id) * multiplier;
            }
            return 0;
        });
    }
};
