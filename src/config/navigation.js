export const VIEW_ROUTES = [
  {
    path: '/identity',
    childPath: 'identity',
    name: 'identity',
    label: 'IDENTITY',
    sub: '简介',
    pageNumber: '01',
    progress: '0%',
    component: () => import('@/views/Identity/Index.vue')
  },
  {
    path: '/projects',
    childPath: 'projects',
    name: 'projects',
    label: 'PROJECTS',
    sub: '项目',
    pageNumber: '02',
    progress: '33%',
    component: () => import('@/views/Projects/Index.vue')
  },
  {
    path: '/music',
    childPath: 'music',
    name: 'music',
    label: 'MUSIC',
    sub: '音乐',
    pageNumber: '03',
    progress: '66%',
    component: () => import('@/views/Music/Index.vue')
  },
  {
    path: '/contact',
    childPath: 'contact',
    name: 'contact',
    label: 'CONTACT',
    sub: '联系方式',
    pageNumber: '04',
    progress: '100%',
    component: () => import('@/views/Contact/Index.vue')
  }
];

export const VIEW_ROUTE_PATHS = VIEW_ROUTES.map((route) => route.path);
