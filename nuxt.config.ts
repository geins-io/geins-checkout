const nitroPreset = {
  nitro: {
    preset: process.env.NITRO_PRESET,
  },
};

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },
  modules: [ 
    '@nuxtjs/tailwindcss',   
    '@nuxtjs/i18n',    
    'shadcn-nuxt',
    'nuxt-svgo',
    'nuxt-lucide-icons',
  ],

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  }, 

  i18n: {
    defaultLocale: 'en',
    langDir: 'lang/',
    locales: [{ code: 'en', language: 'en-US', file: 'en-US.ts' }],
  },

  runtimeConfig: {
    public: {
    },
    private: {},
  },

  sourcemap: {
    server: false,
    client: true,
  },

  ...(process.env.NITRO_PRESET ? nitroPreset : {}),

  compatibilityDate: '2025-02-11',
});