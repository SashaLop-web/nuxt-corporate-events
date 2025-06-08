import { defineEventHandler, readBody } from 'h3'
import { getDB } from '~/server/database/db'

export default defineEventHandler(async event => {
	try {
		const rawId = event.context.params?.id
		if (!rawId || isNaN(Number(rawId))) {
			throw new Error('Некорректный ID мероприятия')
		}
		const id = Number(rawId)

		const body = await readBody(event)
		if (!body || typeof body !== 'object') {
			throw new Error('Пустое или некорректное тело запроса')
		}

		const {
			title,
			type,
			description,
			organizer_id,
			location,
			location_comment,
			event_date,
			is_announced,
			participants, // ✅ добавлены участники
		} = body

		if (!title || !event_date) {
			throw new Error('Недостаточно данных для обновления мероприятия')
		}

		const db = await getDB()

		// Обновление мероприятия
		const updated = await db('events')
			.where({ id })
			.update({
				title,
				type: type || 'meeting',
				description: description || null,
				organizer_id,
				location: location || null,
				location_comment: location_comment || null,
				event_date,
				is_announced: is_announced || false,
			})

		if (!updated) {
			throw new Error('Мероприятие с таким ID не найдено')
		}

		// Обновление приглашений, если указаны участники
		if (type === 'meeting' && Array.isArray(participants)) {
			// Удаляем старые приглашения
			await db('invitations').where({ event_id: id }).del()

			// Добавляем новые приглашения
			for (const userId of participants) {
				await db('invitations').insert({
					event_id: id,
					user_id: Number(userId),
					status: 'pending',
					comment: null,
				})
			}
		}

		return {
			status: 'success',
			message: 'Мероприятие успешно обновлено',
		}
	} catch (error: any) {
		console.error('Ошибка обновления мероприятия:', error.message)
		event.res.statusCode = 400
		return {
			status: 'error',
			message: error.message || 'Ошибка сервера',
		}
	}
})
