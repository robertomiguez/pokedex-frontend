import { getDb } from '../db';
import type { Pokemon } from '@/types/domain';

export const pokemonRepository = {
    async getAll(): Promise<Pokemon[]> {
        const db = await getDb();
        return db.getAll('pokemon');
    },

    async getById(id: number): Promise<Pokemon | undefined> {
        const db = await getDb();
        return db.get('pokemon', id);
    },

    async save(pokemon: Pokemon): Promise<void> {
        const db = await getDb();
        await db.put('pokemon', pokemon);
    },

    async saveMany(pokemons: Pokemon[]): Promise<void> {
        const db = await getDb();
        const tx = db.transaction('pokemon', 'readwrite');
        const store = tx.objectStore('pokemon');

        await Promise.all([
            ...pokemons.map(p => store.put(p)),
            tx.done
        ]);
    }
};
