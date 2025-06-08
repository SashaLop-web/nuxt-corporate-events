import { defineEventHandler, readBody } from 'h3'
import jwt from 'jsonwebtoken'
import { getDB } from '~/server/database/db'

interface JwtPayload {
	id: number
	email: string
	role: string
}

export default defineEventHandler(async event => {
	try {
		const body = await readBody(event)
		const token = body.token

		if (!token) {
			throw new Error('Токен не предоставлен')
		}

		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET || 'fallback-secret'
		) as JwtPayload

		const db = await getDB()
		const user = await db('users')
			.select('id', 'full_name', 'email', 'role', 'created_at')
			.where({ id: decoded.id })
			.first()

		if (!user) {
			throw new Error('Пользователь не найден')
		}

		return {
			status: 'success',
			user,
		}
	} catch (error: any) {
		event.res.statusCode = 401
		return {
			status: 'error',
			message: error.message || 'Ошибка проверки токена',
		}
	}
})
