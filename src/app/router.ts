import { createRouter, createWebHistory } from 'vue-router';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/editor' },
    {
      path: '/editor',
      component: () => import('@/editor/index.vue')
    },
    {
      path: '/preview',
      component: () => import('@/preview/PreviewPage.vue')
    }
  ]
});
