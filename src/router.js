import { createRouter, createWebHistory } from 'vue-router';

// TODO check # da rimuovere, 404 error?
const routes = [
    { path: '/', component: () => import('./components/HomePage.vue'), },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;