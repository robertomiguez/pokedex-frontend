import { describe, it, expect } from 'vitest';
import { pokemonFilters } from '../../src/utils/pokemonFilters';
import type { Pokemon } from '../../src/types/domain';

describe('pokemonFilters', () => {
    const mockPokemon: Pokemon[] = [
        { id: 1, name: 'Bulbasaur', types: ['grass', 'poison'] } as any,
        { id: 4, name: 'Charmander', types: ['fire'] } as any,
        { id: 7, name: 'Squirtle', types: ['water'] } as any,
        { id: 25, name: 'Pikachu', types: ['electric'] } as any,
    ];

    it('should filter by name search', () => {
        const result = pokemonFilters.filter(mockPokemon, { search: 'bulb' });
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Bulbasaur');
    });

    it('should filter by ID search', () => {
        const result = pokemonFilters.filter(mockPokemon, { search: '25' });
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Pikachu');
    });

    it('should filter by type', () => {
        const result = pokemonFilters.filter(mockPokemon, { type: 'fire' });
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Charmander');
    });

    it('should return all if no filters provided', () => {
        const result = pokemonFilters.filter(mockPokemon, {});
        expect(result).toHaveLength(4);
    });

    it('should handle combined filters', () => {
        // Search "saur" and type "grass"
        const result = pokemonFilters.filter(mockPokemon, { search: 'saur', type: 'grass' });
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Bulbasaur');
    });

    it('should return empty if no match', () => {
        const result = pokemonFilters.filter(mockPokemon, { search: 'Char', type: 'water' });
        expect(result).toHaveLength(0);
    });
});
