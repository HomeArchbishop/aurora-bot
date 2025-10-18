import fs from 'fs/promises'

interface TempDirOptions {
  path: string
}

export async function createTempDir ({ path }: TempDirOptions) {
  await fs.mkdir(path, { recursive: true })
  return () => path
}
