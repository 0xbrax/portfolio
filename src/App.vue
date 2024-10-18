<template>
    <Navbar />

    <transition name="fade-out">
        <Loader v-if="isLoaderActive" @start="isLoaderActive = false" />
    </transition>

    <transition name="fade">
        <Menu v-show="isMenuVisible" />
    </transition>

    <router-view v-slot="{ Component }">
        <transition name="fade">
            <component :is="Component" />
        </transition>
    </router-view>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import Menu from "@/components/Menu.vue";
import Loader from "@/components/Loader.vue";
import { ref, provide } from "vue";

export default {
    name: "App",
    components: {
        Navbar,
        Menu,
        Loader
    },
    setup() {
        const isMenuVisible = ref(false);
        provide('isMenuVisible', isMenuVisible);

        const isLoaderActive = ref(true);



        window.addEventListener('click', () => {
            console.log('- - - CPU CLICK TEST - - -')
        });

        return {
            isLoaderActive,
            isMenuVisible
        }
    }
}
</script>
