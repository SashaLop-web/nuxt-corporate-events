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
		const rawToken = event.headers.get('Authorization')
		if (!rawToken || !rawToken.startsWith('Bearer ')) {
			throw new Error('Некорректный или отсутствующий токен')
		}

		const decoded = jwt.verify(
			rawToken.split(' ')[1],
			process.env.JWT_SECRET || 'fallback-secret'
		) as JwtPayload

		const body = await readBody(event)

		if (!body || typeof body !== 'object') {
			throw new Error('Пустое или некорректное тело запроса')
		}

		const {
			title,
			event_date,
			type,
			description,
			location,
			location_comment,
			is_announced,
			participants,
		} = body

		if (!title || !event_date) {
			throw new Error('Недостаточно данных для создания мероприятия')
		}

		const db = await getDB()

		const [eventId] = await db('events').insert({
			title,
			type: type || 'meeting',
			description: description || null,
			organizer_id: decoded.id,
			location: location || null,
			location_comment: location_comment || null,
			event_date,
			is_announced: is_announced || false,
		})

		const participantTypes = ['meeting_individual', 'meeting']

		if (participantTypes.includes(type)) {
			if (!Array.isArray(participants) || participants.length === 0) {
				throw new Error('Для выбранного типа необходимо указать участников')
			}

			const validParticipants = participants
				.map((id: any) => Number(id))
				.filter((id: number) => !isNaN(id))

			for (const userId of validParticipants) {
				await db('invitations').insert({
					event_id: eventId,
					user_id: userId,
					status: 'pending',
					comment: null,
				})

				await db('notifications').insert({
					user_id: userId,
					event_id: eventId,
					message: `Вас пригласили на мероприятие: "${title}"`,
					type: 'event_invite',
					is_read: false,
					scheduled_time: null,
					created_at: new Date().toISOString(),
				})
			}
		}

		return {
			status: 'success',
			message: 'Мероприятие успешно создано',
			eventId,
		}
	} catch (error: any) {
		console.error('Ошибка создания мероприятия:', error.message)
		event.res.statusCode = 400
		return {
			status: 'error',
			message: error.message || 'Ошибка сервера',
		}
	}
})
