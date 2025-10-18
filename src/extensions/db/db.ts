import { Level } from 'level'

interface DbOptions {
  path: string
}

class DbConstructor extends Level {
  constructor ({ path }: DbOptions) {
    super(path, { valueEncoding: 'json' })
  }
}

export type Db = DbConstructor

export async function createDb ({ path }: DbOptions): Promise<() => Db> {
  const db = new DbConstructor({ path })
  await db.open()
  return () => db
}
