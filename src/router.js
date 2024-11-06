import { createRouter, createWebHistory } from "vue-router";

const routes = [
    { path: "/", component: () => import("@/components/Home.vue") },

    // 404 error
    {
        path: "/:catchAll(.*)",
        component: () => import("@/components/NotFound.vue"),
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
