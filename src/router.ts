import { createRouter, createWebHistory } from 'vue-router';
import { config } from './config'
import { layouts } from './layouts/index'
import NotFound from './pages/404.page.vue'
import HomePage from './pages/Home.page.vue'
import { tools } from './tools'

const toolsRoutes = tools.map(({ path, name, component, key, ...config }) => ({
  path,
  name: key,
  component,
  meta: { isTool: true, layout: layouts.toolLayout, name, ...config },
}));
const toolsRedirectRoutes = tools
  .filter(({ redirectFrom }) => redirectFrom && redirectFrom.length > 0)
  .flatMap(
    ({ path, redirectFrom }) => redirectFrom?.map(redirectSource => ({ path: redirectSource, redirect: path })) ?? [],
  );

const router = createRouter({
  history: createWebHistory(config.app.baseUrl),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('./pages/About.vue'),
    },
    ...toolsRoutes,
    ...toolsRedirectRoutes,
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  ],
});

export default router;
