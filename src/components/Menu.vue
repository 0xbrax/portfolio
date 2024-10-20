<template>
    <div id="menu" class="h-full w-full p-4 pt-20 absolute z-[499] left-0 top-0 flex justify-center items-center">
        <div class="h-full text-center flex flex-col justify-around items-center gap-2">
            <div class="flex flex-col items-center gap-4">
                <div>
                    <span>Do you wanna change the world?</span>
                    <br />
                    <span>Let's try seed between -1000 and 1000</span>
                </div>

                <label class="input input-bordered w-64 flex items-center gap-2">
                    <input
                        v-model="currentWorldSeed"
                        @input="checkWorldSeed($event.target.value)"
                        type="number"
                        min="-1000"
                        max="1000"
                        class="grow"
                        placeholder="World seed"
                    />
                    <LucideDices @click="getRandomWorldSeed()" />
                </label>

                <button
                    @click="settingStore.generateNewPlanet(currentWorldSeed)"
                    :disabled="!settingStore.isNewPlanetReady"
                    class="btn btn-primary"
                >
                    <span v-show="!settingStore.isNewPlanetReady">Loading</span>
                    <span v-show="!settingStore.isNewPlanetReady" class="loading loading-spinner"></span>

                    <span v-show="settingStore.isNewPlanetReady">Generate world</span>
                    <LucideEarth v-show="settingStore.isNewPlanetReady" />
                </button>
            </div>

            <div>
                <!-- TODO music -->
                VOLUME
            </div>

            <div class="flex flex-col md:flex-row">
                <a href="https://github.com/0xbrax" target="_blank"><div class="badge badge-neutral">GitHub</div></a>
                <div class="divider m-0 md:divider-horizontal"></div>
                <a href="https://www.linkedin.com/in/marco-braccini" target="_blank"><div class="badge badge-neutral">LinkedIn</div></a>
                <div class="divider m-0 md:divider-horizontal"></div>
                <a href="https://x.com/0xbrax" target="_blank"><div class="badge badge-neutral">X</div></a>
                <div class="divider m-0 md:divider-horizontal"></div>
                <a href="https://www.instagram.com/0xbrax" target="_blank"><div class="badge badge-neutral">Instagram</div></a>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, watch } from "vue";
import { useSettingStore } from "@/store/setting.js";
import { getPseudoRandomInt } from "@/assets/utils.js";

export default {
    name: "Menu",
    setup() {
        const settingStore = useSettingStore();
        const currentWorldSeed = ref(null);

        const checkWorldSeed = (value) => {
            if (value === '') {
                currentWorldSeed.value = 0;
                return;
            }

            const number = parseInt(value);
            if (number < -1_000) {
                currentWorldSeed.value = -1_000;
            }
            if (number > 1_000) {
                currentWorldSeed.value = 1_000;
            }
        };

        const getRandomWorldSeed = () => {
            const randomNumber = getPseudoRandomInt(-1000, 1000);
            currentWorldSeed.value = randomNumber;
        };

        watch(
            () => settingStore.worldSeed,
            (value) => {
                currentWorldSeed.value = value;
            },
            {
                immediate: true
            }
        );

        return {
            settingStore,
            currentWorldSeed,
            checkWorldSeed,
            getRandomWorldSeed
        }
    }
}
</script>

<style>
#menu {
    background-color: var(--fallback-b2, oklch(var(--b2) / var(--tw-bg-opacity)));
    --tw-bg-opacity: 0.8;
}
</style>