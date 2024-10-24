<template>
    <div id="menu" class="h-full w-full p-4 pt-20 absolute z-[499] left-0 top-0">
        <div class="h-full text-center flex flex-col justify-between md:justify-around items-center gap-4 overflow-y-auto">
            <div v-if="$route.path === '/'" class="flex flex-col items-center gap-4">
                <div>
                    <span>Do you wanna change the world?</span>
                    <br />
                    <span>Let's try a different seed number between -1000 and 1000</span>
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

            <label v-if="$route.path === '/'" class="swap">
                <input v-model="settingStore.isAudioActive" type="checkbox" />

                <svg
                    class="swap-on fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                >
                    <path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z" />
                </svg>
                <svg
                    class="swap-off fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                >
                    <path d="M3,9H7L12,4V20L7,15H3V9M16.59,12L14,9.41L15.41,8L18,10.59L20.59,8L22,9.41L19.41,12L22,14.59L20.59,16L18,13.41L15.41,16L14,14.59L16.59,12Z" />
                </svg>
            </label>

            <div class="flex flex-col md:flex-row">
                <a href="https://github.com/0xbrax" target="_blank"><div class="badge badge-neutral">GitHub</div></a>
                <div class="divider m-0 md:divider-horizontal"></div>
                <a href="https://www.linkedin.com/in/marco-braccini" target="_blank"><div class="badge badge-neutral">LinkedIn</div></a>
                <div class="divider m-0 md:divider-horizontal"></div>
                <a href="https://x.com/0xbrax" target="_blank"><div class="badge badge-neutral">X</div></a>
                <div class="divider m-0 md:divider-horizontal"></div>
                <a href="https://www.instagram.com/0xbrax" target="_blank"><div class="badge badge-neutral">Instagram</div></a>
            </div>

            <img class="h-32" src="/images/dreampool_256.webp" alt="Dreampool">



            <div v-if="$route.path === '/'" class="w-full md:w-1/2 bg-base-200 mt-8 p-2 italic">
                <p class="font-bold">CREDITS</p>

                <ul class="mt-2">
                    <li>ciao mondo</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, watch } from "vue";
import { useSettingStore } from "@/store/setting.js";
import { getPseudoRandomInt } from "@/assets/utils.js";
import { Howler } from "howler";

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

        watch(
            () => settingStore.isAudioActive,
            (value) => {
                if (value) Howler.mute(false);
                else Howler.mute(true);
            },
            {
                immediate: true
            }
        )

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