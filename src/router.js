import { createRouter, createWebHistory } from 'vue-router';

// TODO check # da rimuovere, 404 error?
const routes = [
    { path: '/', component: () => import('./components/HomePage.vue') },
    { path: '/projects/pikaride', component: () => import('./components/projects/PikaRide.vue') },

    // 404 error catch
    { path: '/:catchAll(.*)', component: () => import('./components/NotFound.vue') },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.options.history.state.back = null;

export default router;