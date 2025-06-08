import knex from 'knex'

const db = knex({
	client: 'sqlite3',
	connection: {
		filename: './database.sqlite',
	},
	useNullAsDefault: true,
})

async function createPositionsTable() {
	await db.schema.createTableIfNotExists('positions', table => {
		table.increments('id').primary()
		table.string('name').notNullable().unique()
	})
}

async function createDepartmentsTable() {
	await db.schema.createTableIfNotExists('departments', table => {
		table.increments('id').primary()
		table.string('name').notNullable()
		table
			.integer('manager_id')
			.unsigned()
			.references('id')
			.inTable('users')
			.onDelete('SET NULL')
		table.text('description').nullable()
		table.text('contact_info').nullable()
		table.timestamp('created_at').defaultTo(db.fn.now())
	})
}

async function createUsersTable() {
	await db.schema.createTableIfNotExists('users', table => {
		table.increments('id').primary()
		table.string('email').notNullable().unique()
		table.string('password').notNullable()
		table.string('full_name').notNullable()
		table
			.integer('position_id')
			.unsigned()
			.references('id')
			.inTable('positions')
			.onDelete('SET NULL')
		table
			.integer('department_id')
			.unsigned()
			.references('id')
			.inTable('departments')
			.onDelete('SET NULL')
		table
			.integer('manager_id')
			.unsigned()
			.references('id')
			.inTable('users')
			.onDelete('SET NULL')
		table.enum('role', ['admin', 'manager', 'employee']).defaultTo('employee')
		table.string('avatar_url').nullable()
		table.timestamp('created_at').defaultTo(db.fn.now())
		table.timestamp('last_login').nullable()
	})
}

async function createEventsTable() {
	await db.schema.createTableIfNotExists('events', table => {
		table.increments('id').primary()
		table.string('title').notNullable()
		table
			.enum('type', ['meeting', 'conference', 'workshop'])
			.defaultTo('meeting')
		table.text('description').nullable()
		table
			.integer('organizer_id')
			.unsigned()
			.notNullable()
			.references('id')
			.inTable('users')
			.onDelete('CASCADE')
		table.string('location').nullable()
		table.text('location_comment').nullable()
		table.timestamp('event_date').notNullable()
		table.boolean('is_announced').defaultTo(false)
		table.timestamp('created_at').defaultTo(db.fn.now())
	})
}

async function createInvitationsTable() {
	await db.schema.createTableIfNotExists('invitations', table => {
		table.increments('id').primary()
		table
			.integer('event_id')
			.unsigned()
			.notNullable()
			.references('id')
			.inTable('events')
			.onDelete('CASCADE')
		table
			.integer('user_id')
			.unsigned()
			.notNullable()
			.references('id')
			.inTable('users')
			.onDelete('CASCADE')
		table
			.enum('status', ['pending', 'accepted', 'declined'])
			.defaultTo('pending')
		table.text('comment').nullable()
		table.timestamp('created_at').defaultTo(db.fn.now())
		table.timestamp('updated_at').defaultTo(db.fn.now())
	})
}

async function createNotificationsTable() {
	await db.schema.createTableIfNotExists('notifications', table => {
		table.increments('id').primary()
		table
			.integer('user_id')
			.unsigned()
			.notNullable()
			.references('id')
			.inTable('users')
			.onDelete('CASCADE')
		table
			.integer('event_id')
			.unsigned()
			.nullable()
			.references('id')
			.inTable('events')
			.onDelete('SET NULL')
		table.text('message').notNullable()
		table.string('type').notNullable()
		table.boolean('is_read').defaultTo(false)
		table.timestamp('scheduled_time').nullable()
		table.timestamp('created_at').defaultTo(db.fn.now())
	})
}

async function createNewsTable() {
	await db.schema.createTableIfNotExists('news', table => {
		table.increments('id').primary()
		table.string('title').notNullable()
		table.text('content').notNullable()
		table
			.integer('event_id')
			.unsigned()
			.nullable()
			.references('id')
			.inTable('events')
			.onDelete('SET NULL')
		table.string('image_url').nullable()
		table
			.integer('author_id')
			.unsigned()
			.notNullable()
			.references('id')
			.inTable('users')
			.onDelete('CASCADE')
		table.timestamp('published_at').defaultTo(db.fn.now())
	})
}

export async function initDB() {
	try {
		console.log('Инициализация базы данных...')

		await createPositionsTable()
		await createDepartmentsTable()
		await createUsersTable()
		await createEventsTable()
		await createInvitationsTable()
		await createNotificationsTable()
		await createNewsTable()

		console.log('✅ Все таблицы успешно созданы и БД подключена')
	} catch (error) {
		console.error('❌ Ошибка инициализации БД:', error)
		throw error
	}
}

export function getDB() {
	return db
}

export async function closeDB() {
	try {
		await db.destroy()
		console.log('✅ Соединение с базой данных закрыто')
	} catch (error) {
		console.error('❌ Ошибка закрытия соединения с БД:', error)
	}
}

process.on('SIGINT', async () => {
	console.log('\nЗавершение работы сервера...')
	await closeDB()
	process.exit(0)
})
