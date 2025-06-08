// server/utils/database.ts

import { getDB } from '../database/db'

export const useDB = async () => {
	return await getDB()
}
