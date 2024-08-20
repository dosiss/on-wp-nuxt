// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devServer: {
    port: 3001,
  },
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  // alias: {
  //   pinia: "/node_modules/@pinia/nuxt/node_modules/pinia/dist/pinia.mjs"
  // },
  app: {
    head: {
      script: [{ src: 'https://telegram.org/js/telegram-web-app.js' }],
    },
  },
  modules: [
      '@nuxt/devtools',
      '@nuxtjs/tailwindcss',
      'nuxt-swiper',
      '@pinia/nuxt'
  ],
  runtimeConfig: {
    public: {
        wordpressUrl: 'https://s03.devdog.space/graphql'
    }
  },
  swiper: {
     modules: ['pagination', 'navigation'], 
  }
})