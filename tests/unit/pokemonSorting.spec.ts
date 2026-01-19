import { describe, it, expect } from 'vitest';
import { pokemonSorting } from '../../src/utils/pokemonSorting';
import type { Pokemon } from '../../src/types/domain';

describe('pokemonSorting', () => {
    const mockPokemon: Pokemon[] = [
        { id: 1, name: 'Bulbasaur' } as any,
        { id: 25, name: 'Pikachu' } as any,
        { id: 4, name: 'Charmander' } as any,
    ];

    it('should sort by ID ascending', () => {
        const result = pokemonSorting.sort(mockPokemon, { field: 'id', direction: 'asc' });
        expect(result.map(p => p.id)).toEqual([1, 4, 25]);
    });

    it('should sort by ID descending', () => {
        const result = pokemonSorting.sort(mockPokemon, { field: 'id', direction: 'desc' });
        expect(result.map(p => p.id)).toEqual([25, 4, 1]);
    });

    it('should sort by Name ascending', () => {
        const result = pokemonSorting.sort(mockPokemon, { field: 'name', direction: 'asc' });
        expect(result.map(p => p.name)).toEqual(['Bulbasaur', 'Charmander', 'Pikachu']);
    });

    it('should sort by Name descending', () => {
        const result = pokemonSorting.sort(mockPokemon, { field: 'name', direction: 'desc' });
        expect(result.map(p => p.name)).toEqual(['Pikachu', 'Charmander', 'Bulbasaur']);
    });

    it('should handle empty list', () => {
        const result = pokemonSorting.sort([], { field: 'name', direction: 'asc' });
        expect(result).toEqual([]);
    });
});
