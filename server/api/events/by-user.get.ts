import { defineEventHandler, getQuery } from 'h3'
import { getDB } from '~/server/database/db'

export default defineEventHandler(async event => {
	try {
		const db = await getDB()
		const query = getQuery(event)
		const organizerId = Number(query.organizer_id)

		if (!organizerId || isNaN(organizerId)) {
			throw new Error('Некорректный organizer_id')
		}

		const events = await db('events')
			.where('organizer_id', organizerId)
			.orderBy('event_date', 'desc') // по дате мероприятия

		return {
			status: 'success',
			events,
		}
	} catch (error: any) {
		console.error('Ошибка получения мероприятий:', error.message)
		event.res.statusCode = 400
		return {
			status: 'error',
			message: error.message || 'Ошибка при получении мероприятий',
		}
	}
})
