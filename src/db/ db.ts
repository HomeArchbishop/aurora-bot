import { Level } from 'level'

interface DbOptions {
  path: string
}

export class Db extends Level {
  constructor ({ path }: DbOptions) {
    super(path, { valueEncoding: 'json' })
  }
}
