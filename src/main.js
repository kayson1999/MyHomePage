/**
 * 应用入口
 * 职责：创建 Vue 应用实例，挂载路由、粒子引擎和全局样式
 */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import Particles from '@tsparticles/vue3'
import { loadSlim } from '@tsparticles/slim'
import './styles/global.css'

const app = createApp(App)
app.use(router)
app.use(Particles, { init: async (engine) => { await loadSlim(engine) } })
app.mount('#app')