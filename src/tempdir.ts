import { createTempDir } from 'aurorax'
import path from 'path'

export const useTempDir = await createTempDir({
  path: path.resolve(import.meta.dirname, '../temp'),
})
