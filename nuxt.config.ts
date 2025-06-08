import 'dotenv/config'

export default defineNuxtConfig({
  css: ['@/assets/styles/main.scss'],

  vite: {
    assetsInclude: ['**/*.woff', '**/*.woff2'], // Для подключения шрифтов
    ssr: {
      noExternal: ['sqlite3']
    }
  },

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'default_fallback_key',
    public: {
      // Публичные переменные при необходимости
    }
  },

  modules: [
    '@pinia/nuxt'
  ],

  plugins: [
    '~/plugins/auth.ts'
  ],

  alias: {
    // Чтобы ~assets работал в SCSS и других местах
    '~assets': '/assets',
    '~fonts': '/assets/fonts'
  },

  compatibilityDate: '2024-11-01',

  devtools: {
    enabled: true
  }
})
