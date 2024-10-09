<template>
    <div id="home" ref="homeEl" class="h-full">

    </div>
</template>

<script>
import { onMounted, onUnmounted, ref } from "vue";
import Experience from '@/experience/Experience.js';
import { RESOURCES, INTEREST_POINTS } from "@/experience/ASSETS.js";

export default {
    name: "Home",
    setup() {
        let experience = null;
        const isExperienceReady = ref(false);

        const homeEl = ref(null);

        onMounted(() => {
            experience = new Experience(homeEl.value, undefined, RESOURCES, INTEREST_POINTS);

            experience.on('loaded', () => {
                // wait for logo transition ends
                const timeout = setTimeout(() => {
                    isExperienceReady.value = true;
                    clearTimeout(timeout);
                }, 300);
            }, { once: true });
        });

        onUnmounted(() => {
            if (experience) experience.destroy();
        });

        return {
            homeEl
        }
    }
}
</script>
