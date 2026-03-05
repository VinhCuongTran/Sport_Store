import { createApp } from 'vue'
import App from './App.vue'
import router from './routers' // Trỏ tới thư mục routers
// import './assets/main.css' // (Bạn có thể thêm css sau)

const app = createApp(App);

app.use(router);

app.mount('#app');