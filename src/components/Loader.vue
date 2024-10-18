<template>
    <div id="loader" class="w-full h-full fixed left-0 top-0 z-[100] flex justify-center items-center">
        <div class="flex flex-col items-center gap-4">
            <div v-if="!settingStore.isExperienceReady" class="text-primary font-bold text-6xl text-center">{{ `${Math.round(settingStore.loaderProgress * 100).toString()} %` }}</div>
            <button v-else @click="$emit('start')" class="btn btn-primary btn-lg">Start</button>

            <progress class="progress progress-secondary w-56" :value="Math.round(settingStore.loaderProgress * 100).toString()" max="100"></progress>

            <div class="text-accent">Your world seed is <span class="inline-block px-2 bg-accent text-white">{{ settingStore.worldSeed !== null ? settingStore.worldSeed : '...' }}</span></div>
        </div>
    </div>
</template>

<script>
import { useSettingStore } from "@/store/setting.js";

export default {
    name: "Loader",
    setup() {
        const settingStore = useSettingStore();

        return {
            settingStore
        }
    }
}
</script>

<style>
#loader {
    background-image: repeating-linear-gradient(45deg,var(--fallback-b1,oklch(var(--b1))),var(--fallback-b1,oklch(var(--b1))) 13px,var(--fallback-b2,oklch(var(--b2))) 13px,var(--fallback-b2,oklch(var(--b2))) 14px);
    background-size: 40px 40px;
}
</style>
