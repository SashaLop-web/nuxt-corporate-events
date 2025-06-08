import { defineNuxtPlugin, useLazyFetch } from '#app'
import { useUserStore } from '~/stores/user'

interface VerifyResponse {
	status: string
	user: {
		id: number
		email: string
		full_name: string
		role: string
	}
}

export default defineNuxtPlugin(async nuxtApp => {
	if (!process.client) return

	const userStore = useUserStore()
	const token = localStorage.getItem('authToken')

	if (token) {
		try {
			const { data, error } = await useLazyFetch<VerifyResponse>(
				'/api/verify-token',
				{
					method: 'POST',
					body: { token },
				}
			)

			if (error.value) {
				throw new Error(error.value.data?.message || 'Токен недействителен')
			}

			userStore.setUser(data.value.user)
		} catch (err) {
			console.error('Ошибка проверки токена:', err)
			localStorage.removeItem('authToken')
		}
	}
})
