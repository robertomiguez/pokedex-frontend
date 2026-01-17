import type { Pokemon } from '@/types/domain';

export function exportPokemonToCSV(pokemonList: Pokemon[]) {
    if (pokemonList.length === 0) return;

    const headers = [
        'ID',
        'Name',
        'Types',
        'HP',
        'Attack',
        'Defense',
        'Special Attack',
        'Special Defense',
        'Speed',
        'Height (m)',
        'Weight (kg)'
    ];

    const rows = pokemonList.map(p => [
        p.id,
        p.name,
        `"${p.types.join(', ')}"`,
        p.stats.hp,
        p.stats.attack,
        p.stats.defense,
        p.stats.specialAttack,
        p.stats.specialDefense,
        p.stats.speed,
        (p.height / 10).toFixed(1),
        (p.weight / 10).toFixed(1)
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
