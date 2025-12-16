import { createRouter, createWebHistory } from 'vue-router';
// 保持你原有的组件引入...
import MainLayout from '../layouts/MainLayout.vue';
import IntroIndex from '../views/Intro/Index.vue';
import Personal from '../views/Intro/Personal.vue';
import Skills from '../views/Intro/Skills.vue';
import Ongoing from '../views/Intro/Ongoing.vue';
import Finished from '../views/Intro/Finished.vue';
import Links from '../views/Intro/Links.vue';
import CollabIndex from '../views/Collab/Index.vue';
import Music from '../views/Collab/Music.vue';
import Dev from '../views/Collab/Dev.vue';
import Contact from '../views/Contact/Index.vue';

const routes = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/intro/personal', // 根路径重定向
    children: [
      {
        path: 'intro',
        component: IntroIndex,
        redirect: '/intro/personal', // 父级路径重定向
        children: [
          { path: 'personal', component: Personal },
          { path: 'skills', component: Skills },
          { path: 'ongoing', component: Ongoing },
          { path: 'finished', component: Finished },
          { path: 'links', component: Links },
        ],
      },
      {
        path: 'collab',
        component: CollabIndex,
        redirect: '/collab/music',
        children: [
          { path: 'music', component: Music },
          { path: 'dev', component: Dev },
        ],
      },
      {
        path: 'contact',
        component: Contact,
      },
    ],
  },
  // 🛡️ 捕获所有未知路径，重回起点
  {
    path: '/:pathMatch(.*)*',
    redirect: '/intro/personal'
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;