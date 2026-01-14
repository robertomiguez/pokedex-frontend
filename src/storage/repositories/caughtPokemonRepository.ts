import { getDb } from '../db';
import type { CaughtPokemon } from '@/types/domain';

export const caughtPokemonRepository = {
    async getAll(): Promise<CaughtPokemon[]> {
        const db = await getDb();
        return db.getAll('caught-pokemon');
    },

    async getById(id: number): Promise<CaughtPokemon | undefined> {
        const db = await getDb();
        return db.get('caught-pokemon', id);
    },

    async save(pokemon: CaughtPokemon): Promise<void> {
        const db = await getDb();
        await db.put('caught-pokemon', pokemon);
    },

    async remove(id: number): Promise<void> {
        const db = await getDb();
        await db.delete('caught-pokemon', id);
    }
};
