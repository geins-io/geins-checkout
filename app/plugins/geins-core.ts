import { defineNuxtPlugin } from '#app';
import { GeinsCore, RuntimeContext, type GeinsSettings } from '@geins/core';
import { GeinsOMS } from '@geins/oms';

export default defineNuxtPlugin((nuxtApp) => {
  const geinsCoreInstance = ref<GeinsCore | undefined>();
  const geinsOMSInstance = ref<GeinsOMS | undefined>();

  // Helper to create a new GeinsCore instance
  const createGeinsCore = async (settings: GeinsSettings): Promise<GeinsCore> => {
    // Check if it's SSR or client
    const isSSR = import.meta.server;

    // SSR: Create a fresh instance for each request
    if (isSSR) {
      // Use SSR context to store instance per request
      if (nuxtApp.ssrContext && !nuxtApp.ssrContext?.geinsCoreInstance) {
        nuxtApp.ssrContext.geinsCoreInstance = new GeinsCore(settings);
      }
      geinsCoreInstance.value = nuxtApp.ssrContext?.geinsCoreInstance as GeinsCore;
    } else {
      // Client-side: Persist the same instance across navigation
      if (!geinsCoreInstance.value) {
        geinsCoreInstance.value = new GeinsCore(settings);
      }
    }
    return geinsCoreInstance.value as GeinsCore;
  };

  const createGeinsOMS = async (core: GeinsCore): Promise<GeinsOMS> => {
    const isSSR = import.meta.server;
    if (isSSR) {
      if (nuxtApp.ssrContext && !nuxtApp.ssrContext?.geinsOMSInstance) {
        nuxtApp.ssrContext.geinsOMSInstance = new GeinsOMS(core, {
          omsSettings: { context: RuntimeContext.HYBRID },
        });
      }
      geinsOMSInstance.value = nuxtApp.ssrContext?.geinsOMSInstance as GeinsOMS;
    } else {
      if (!geinsOMSInstance.value) {
        geinsOMSInstance.value = new GeinsOMS(core, {
          omsSettings: { context: RuntimeContext.HYBRID },
        });
      }
    }
    return geinsOMSInstance.value as GeinsOMS;
  };

  return {
    provide: {
      geinsCore: geinsCoreInstance,
      geinsOMS: geinsOMSInstance,
      createGeinsCore: createGeinsCore,
      createGeinsOMS: createGeinsOMS,
      createGeinsClient: async (settings: GeinsSettings): Promise<void> => {
        await createGeinsCore(settings);
        await createGeinsOMS(geinsCoreInstance.value as GeinsCore);
      },
    },
  };
});
