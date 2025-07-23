import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router.js'
import { Form, Field, CellGroup, Toast, RadioGroup, Radio,NumberKeyboard } from 'vant';
import 'vant/lib/index.css'; //样式全局引入，否则效果无法展示

const app=createApp(App)
app.use(router)
app.use(Form);
app.use(Field);
app.use(CellGroup);
app.use(Toast);
app.use(Radio);
app.use(RadioGroup);
app.use(NumberKeyboard);
app.mount('#app')