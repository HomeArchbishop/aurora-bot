import { createDb } from '@/extensions/db'
import path from 'path'

export const useDatabase = await createDb({
  path: path.resolve(import.meta.dirname, '../database'),
})
