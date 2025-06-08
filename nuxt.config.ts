// https://nuxt.com/docs/api/configuration/nuxt-config
import 'dotenv/config';
export default defineNuxtConfig({
	css: ['@/assets/styles/main.scss'],
	vite: {
		ssr: {
			noExternal: ['sqlite3'], // Форсируем обработку модуля
		},
	},
	runtimeConfig: {
		jwtSecret: process.env.JWT_SECRET || 'default_fallback_key',
		public: {
			// Публичные переменные (если нужны)
		},
	},
	modules: [
		'@pinia/nuxt', // Добавляем Pinia как модуль
	],
	plugins: [
		'~/plugins/auth.ts', // Явное подключение плагина
	],
	compatibilityDate: '2024-11-01',

	devtools: { enabled: true },
})
