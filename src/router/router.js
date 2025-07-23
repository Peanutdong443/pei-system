// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HelloWorld from '../components/WJ.vue'

const routes = [
  {
    path: '/',
    name: 'HelloWorld',
    component: HelloWorld
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router