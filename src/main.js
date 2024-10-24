import { createApp } from 'vue';
import './assets/style.css';
import { register } from 'swiper/element/bundle';
import { Howler } from "howler";

import App from './App.vue';
import router from "@/router.js";
import { store } from '@/store/index.js';
import { useSettingStore } from "@/store/setting.js";
import { $isMobile } from "@/assets/utils.js";

import {
    LucideHouse,
    LucideRabbit,
    LucidePlane,
    LucideEarth,
    LucideDices,
    LucideSquareArrowUpRight,
    LucideInfo,
    LucideMoveDown
} from "lucide-vue-next";



register();
const app = createApp(App);

app.use(router);
app.use(store());
const settingStore = useSettingStore();

app.config.globalProperties.$isMobile = $isMobile;

app.component('LucideHouse', LucideHouse);
app.component('LucideRabbit',LucideRabbit);
app.component('LucidePlane', LucidePlane);
app.component('LucideEarth', LucideEarth);
app.component('LucideDices', LucideDices);
app.component('LucideSquareArrowUpRight', LucideSquareArrowUpRight);
app.component('LucideInfo', LucideInfo);
app.component('LucideMoveDown', LucideMoveDown);



// INIT
app.mount('#app');

document.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        if (settingStore.isAudioActive) Howler.mute(false);
    } else {
        if (settingStore.isAudioActive) Howler.mute(true);
    }
});
