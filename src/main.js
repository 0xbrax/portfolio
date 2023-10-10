import { createApp } from 'vue';
import App from '@/App.vue';
import router from '@/router.js';
import { createPinia } from 'pinia';

const app = createApp(App);
const store = createPinia();

app.use(router);
app.use(store);

// MOUNT
app.mount('#app');