import { createApp } from 'vue';
import './assets/style.css';
//import { register } from 'swiper/element/bundle';

import App from './App.vue';
import router from "@/router.js";
import { store } from '@/store/index.js';
import { $isMobile } from "@/assets/utils.js";



//register();
const app = createApp(App);

app.use(router);
app.use(store());

app.config.globalProperties.$isMobile = $isMobile;



// INIT
app.mount('#app');
