import { defineEventHandler, readBody } from 'h3'
import jwt from 'jsonwebtoken'
import { getDB } from '~/server/database/db'

interface JwtPayload {
	id: number
}

export default defineEventHandler(async event => {
	try {
		const rawToken = event.headers.get('Authorization')
		if (!rawToken?.startsWith('Bearer ')) {
			throw new Error('Токен отсутствует')
		}

		const decoded = jwt.verify(
			rawToken.split(' ')[1],
			process.env.JWT_SECRET || 'fallback-secret'
		) as JwtPayload

		const body = await readBody(event)
		const ids = Array.isArray(body.ids) ? body.ids : []

		if (!ids.length) {
			throw new Error('Нет уведомлений для пометки как прочитанные')
		}

		const db = await getDB()

		await db('notifications')
			.whereIn('id', ids)
			.andWhere('user_id', decoded.id)
			.update({ is_read: true })

		return { status: 'success', message: 'Уведомления обновлены' }
	} catch (error: any) {
		event.res.statusCode = 400
		return {
			status: 'error',
			message: error.message || 'Ошибка обновления уведомлений',
		}
	}
})
