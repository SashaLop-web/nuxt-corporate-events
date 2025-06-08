import { defineNuxtRouteMiddleware, navigateTo, useError } from '#app'
import { useUserStore } from '~/stores/user'

export default defineNuxtRouteMiddleware(to => {
	const user = useUserStore().user

	if (!user) {
		return navigateTo('/login')
	}

	const allowedRoles = (to.meta.roles as string[]) || []

	if (allowedRoles.length && !allowedRoles.includes(user.role)) {
		useError().value = {
			statusCode: 403,
			message: 'У вас нет доступа к этой странице',
			fatal: true,
			unhandled: true,
			name: 'ForbiddenError',
			toJSON() {
				return {
					statusCode: this.statusCode,
					message: this.message,
				}
			},
		}
	}
})
