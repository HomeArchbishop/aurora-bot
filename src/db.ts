import { Level } from 'level'
import path from 'path'

const db = new Level(path.resolve(__dirname, '../database'), { valueEncoding: 'json' })

export { db }
