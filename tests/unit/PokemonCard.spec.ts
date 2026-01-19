import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PokemonCard from '../../src/components/pokemon/PokemonCard.vue';
import type { Pokemon } from '../../src/types/domain';

describe('PokemonCard.vue', () => {
    const mockPokemon: Pokemon = {
        id: 1,
        name: 'Bulbasaur',
        imageUrl: 'https://example.com/bulb.png',
        types: ['grass', 'poison'],
        stats: {} as any,
        height: 7,
        weight: 69
    };

    it('renders pokemon name and ID correctly', () => {
        const wrapper = mount(PokemonCard, {
            props: { pokemon: mockPokemon }
        });
        
        expect(wrapper.text()).toContain('Bulbasaur');
        expect(wrapper.text()).toContain('#001'); // Checks ID formatting
    });

    it('renders types', () => {
        const wrapper = mount(PokemonCard, {
            props: { pokemon: mockPokemon }
        });
        
        const types = wrapper.findAll('.type-badge');
        expect(types).toHaveLength(2);
        expect(types[0].text()).toBe('grass');
        expect(types[1].text()).toBe('poison');
    });

    it('applies is-caught class when prop is true', () => {
        const wrapper = mount(PokemonCard, {
            props: { 
                pokemon: mockPokemon,
                isCaught: true
            }
        });
        
        expect(wrapper.classes()).toContain('is-caught');
    });

    it('does not apply is-caught class when prop is false', () => {
        const wrapper = mount(PokemonCard, {
            props: { 
                pokemon: mockPokemon,
                isCaught: false
            }
        });
        
        expect(wrapper.classes()).not.toContain('is-caught');
    });
});
