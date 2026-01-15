import type { Pokemon } from '@/types/domain';

export function exportPokemonToCSV(pokemonList: Pokemon[]) {
    if (pokemonList.length === 0) return;

    const headers = ['ID', 'Name', 'Types', 'Height', 'Weight'];
    const rows = pokemonList.map(p => [
        p.id,
        p.name,
        p.types.join(';'),
        p.stats.height,
        p.stats.weight
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'pokedex_export.csv');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
