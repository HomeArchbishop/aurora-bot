import { createDb } from 'aurorax'
import path from 'path'

export const useDatabase = await createDb({
  path: path.resolve(import.meta.dirname, '../database'),
})
