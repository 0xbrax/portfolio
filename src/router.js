import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    { path: '/', component: () => import('./components/HomePage.vue') },
    { path: '/project/pikaride', component: () => import('./components/projects/PikaRide.vue') },
    { path: '/project/starway', component: () => import('./components/projects/Starway.vue') },
    { path: '/project/fruitcocktail', component: () => import('./components/projects/FruitCocktail.vue') },
    { path: '/project/spinwatch', component: () => import('./components/projects/SpinWatch.vue') },

    // 404 error
    { path: '/:catchAll(.*)', component: () => import('./components/NotFound.vue') },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.options.history.state.back = null;

export default router;