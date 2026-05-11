import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import { VIEW_ROUTES } from '@/config/navigation';

const childRoutes = VIEW_ROUTES.map(({ childPath, name, component }) => ({
  path: childPath,
  name,
  component
}));

const routes = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/identity',
    children: childRoutes,
  },
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
