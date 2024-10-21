<template>
    <Navbar />

    <transition name="fade-out">
        <Loader v-if="isLoaderActive && $route.path === '/'" @onStart="onStart()" />
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
import { useSettingStore } from "@/store/setting.js";

export default {
    name: "App",
    components: {
        Navbar,
        Menu,
        Loader
    },
    setup() {
        const settingStore = useSettingStore();

        const isMenuVisible = ref(false);
        provide('isMenuVisible', isMenuVisible);
        const isLoaderActive = ref(true);

        const onStart = () => {
            isLoaderActive.value = false;
            settingStore.hasExperienceEntered = true;

            if (settingStore.isFirstTimeVisit) {
                settingStore.isFirstTimeVisit = false;
                settingStore.isInfoModalNeeded = true;
            }
        };

        return {
            isLoaderActive,
            isMenuVisible,
            onStart
        }
    }
}
</script>
