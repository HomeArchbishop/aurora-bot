import { createTempDir } from '@/extensions/tempDir'
import path from 'path'

export const useTempDir = await createTempDir({
  path: path.resolve(import.meta.dirname, '../temp'),
})
