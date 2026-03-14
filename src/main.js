import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';
import vueLenis from 'lenis/vue';

import './assets/styles.css';

const app = createApp(App);

app.use(router);
app.use(vueLenis);
app.mount('#app');