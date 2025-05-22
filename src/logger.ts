import winston, { format, transports } from 'winston'
import 'winston-daily-rotate-file'

const dailyTransport = new winston.transports.DailyRotateFile({
  dirname: 'logs',
  filename: 'log-%DATE%.log',
  level: 'debug',
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
})

const logger = winston.createLogger({
  level: 'silly',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.align(),
    format.printf(({ level, message, timestamp }) => {
      return `${timestamp as string} ${level}:${message as string}`
    })
  ),
  transports: [
    new transports.Console(),
    dailyTransport
  ]
})

export { logger }
