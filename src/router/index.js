import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';

const routes = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/identity'
  },
  {
    path: '/identity',
    name: 'identity',
    component: MainLayout,
    meta: { section: 'identity' }
  },
  {
    path: '/projects',
    name: 'projects',
    component: MainLayout,
    meta: { section: 'projects' }
  },
  {
    path: '/blog',
    name: 'blog',
    component: MainLayout,
    meta: { section: 'blog' }
  },
  {
    path: '/music',
    name: 'music',
    component: MainLayout,
    meta: { section: 'music' }
  },
  {
    path: '/contact',
    name: 'contact',
    component: MainLayout,
    meta: { section: 'contact' }
  },
  // 🛡️ 捕获所有未知路径，重回起点
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;