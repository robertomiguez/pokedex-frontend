import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Pokemon, CaughtPokemon } from '@/types/domain';

const DB_NAME = 'pokedex-db';
const DB_VERSION = 1;

export interface PokedexDB extends DBSchema {
    pokemon: {
        key: number;
        value: Pokemon;
    };
    'caught-pokemon': {
        key: number;
        value: CaughtPokemon;
    };
}

let dbPromise: Promise<IDBPDatabase<PokedexDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<PokedexDB>> {
    if (!dbPromise) {
        dbPromise = openDB<PokedexDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                // Store for caching Pokemon data from API
                if (!db.objectStoreNames.contains('pokemon')) {
                    db.createObjectStore('pokemon', { keyPath: 'id' });
                }

                // Store for user's caught Pokemon
                if (!db.objectStoreNames.contains('caught-pokemon')) {
                    db.createObjectStore('caught-pokemon', { keyPath: 'id' });
                }
            },
        });
    }
    return dbPromise;
}
