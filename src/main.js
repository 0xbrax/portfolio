import { createApp } from 'vue';
import './assets/style.css';
import { register } from 'swiper/element/bundle';

import App from './App.vue';
import router from "@/router.js";
import { store } from '@/store/index.js';
import { $isMobile } from "@/assets/utils.js";

import {
    LucidePlane,
    LucideEarth,
    LucideDices,
    LucideSquareArrowUpRight,
    LucideVolume2,
    LucideVolumeX,
    LucideInfo
} from "lucide-vue-next";



register();
const app = createApp(App);

app.use(router);
app.use(store());

app.config.globalProperties.$isMobile = $isMobile;

app.component('LucidePlane', LucidePlane);
app.component('LucideEarth', LucideEarth);
app.component('LucideDices', LucideDices);
app.component('LucideSquareArrowUpRight', LucideSquareArrowUpRight);
app.component('LucideVolume2', LucideVolume2);
app.component('LucideVolumeX', LucideVolumeX);
app.component('LucideInfo', LucideInfo);



// INIT
app.mount('#app');
