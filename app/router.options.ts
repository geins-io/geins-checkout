import type { RouterConfig } from '@nuxt/schema';

export default {
  routes: (routes) => {
    const newRoutes = [...routes];
    newRoutes.push({
      name: `token`,
      path: `/:token`,
      component: () => import('~/pages/redirect.vue'),
      props: true,
    });
    newRoutes.push({
      name: `checkout-token`,
      path: `/checkout/:token`,
      component: () => import('~/pages/redirect.vue'),
      props: true,
    });
    newRoutes.push({
      name: `v0-token`,
      path: `/v0/:token`,
      component: () => import('~/pages/redirect.vue'),
      props: true,
    });

    return newRoutes;
  },
} satisfies RouterConfig;
