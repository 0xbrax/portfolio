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
    LucideSquareArrowUpRight
} from "lucide-vue-next";



register();
const app = createApp(App);

app.use(router);
app.use(store());

app.config.globalProperties.$isMobile = $isMobile;

app.component('LucidePlane', LucidePlane);
app.component('LucideEarth', LucideEarth);



// INIT
app.mount('#app');
