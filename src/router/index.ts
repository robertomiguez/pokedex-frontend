import { createRouter, createWebHistory } from 'vue-router';
import AllPokemonView from '@/views/AllPokemonView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: AllPokemonView,
        },
        {
            path: '/pokedex',
            name: 'pokedex',
            component: () => import('@/views/MyPokedexView.vue'),
        },
    ],
});

export default router;
