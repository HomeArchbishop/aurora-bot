import { scheduleJob } from 'node-schedule'
import type winston from 'winston'
import WebSocket from 'ws'
import type { ApiRequest } from './types/api'
import type { Event } from './types/event'
import path from 'path'
import { existsSync, mkdirSync } from 'fs'
import { type Level } from 'level'

interface AppOptions {
  url: string
  logger: winston.Logger
  db: Level<string, string>
}

type CtxSend = (data: Omit<ApiRequest, 'echo'>) => string
interface MiddlewareCtx { event: Event, send: CtxSend, tempdir: string, db: Level<string, string> }
interface JobCtx { send: CtxSend, tempdir: string, db: Level<string, string> }
type Middleware = (ctx: MiddlewareCtx, next: () => Promise<void>) => Promise<void>
type Job = (ctx: JobCtx) => Promise<void>

class App {
  constructor ({ url, logger, db }: AppOptions) {
    this.#logger = logger
    this.#ws = new WebSocket(url)
    this.#db = db

    if (!existsSync(this.#tempdir)) {
      this.#logger.info('tempdir not exists, creating...')
      this.#logger.debug('tempdir: ' + this.#tempdir)
      mkdirSync(this.#tempdir, { recursive: true })
    }

    this.#ctxSend = (...[data]: Parameters<CtxSend>) => {
      const hash = Math.random().toString(36).slice(2, 10)
      const echoData = { ...data, echo: hash }
      const raw = JSON.stringify(echoData)
      this.#logger.debug(`ws sending with echo:${hash}: ` + raw)
      this.#logger.silly(`ws sending with echo:${hash}: ` + JSON.stringify(echoData, null, 2))
      this.#ws.send.bind(this.#ws)(raw)
      this.#logger.debug(`ws sent with echo:${hash}`)
      return hash
    }
  }

  readonly #logger: winston.Logger
  readonly #ws: WebSocket
  readonly #db: Level<string, string>
  readonly #jobs: Job[] = []
  readonly #middlewares: Middleware[] = [
    async (_, next) => { await next() }
  ]

  readonly #ctxSend: CtxSend
  readonly #tempdir = path.resolve(__dirname, '../temp')

  useMw (mw: Middleware): this {
    this.#middlewares.push(mw)
    return this
  }

  useJob (spec: string, job: Job): this {
    const index = this.#jobs.length
    this.#jobs.push(job)
    const { name } = scheduleJob(spec, async () => {
      const ctx: JobCtx = { send: this.#ctxSend, tempdir: this.#tempdir, db: this.#db }
      try {
        this.#logger.info(`job ${name} ${index} with spec:"${spec}" triggered`)
        await job(ctx)
        this.#logger.info(`job ${name} ${index} with spec:"${spec}" finished`)
      } catch (err: any) {
        this.#logger.error(`job ${name} ${index} with spec:"${spec}" error: ` + err.message)
        if (err instanceof Error) {
          this.#logger.error(err.stack)
        }
      }
    })
    this.#logger.info(`job ${name} ${index} with spec:"${spec}" created`)
    return this
  }

  start (): void {
    this.#ws.addEventListener('open', () => {
      this.#logger.info('ws connected')
    })

    this.#ws.addEventListener('error', (err) => {
      this.#logger.error('ws error: ' + err.message)
    })

    this.#ws.addEventListener('message', (wsMsgEvent) => {
      const hash = Math.random().toString(36).slice(2, 10)
      const raw = String(wsMsgEvent.data) // WebSocketMessageEvent.data is a BufferSource
      this.#logger.debug(`ws received ws_msg#${hash}: ` + raw)
      const event = JSON.parse(raw)
      this.#logger.silly(`parsed ws_msg#${hash}: ` + JSON.stringify(event, null, 2))
      const ctx = { event, send: this.#ctxSend, tempdir: this.#tempdir, db: this.#db }
      const next = async (index: number): Promise<void> => {
        if (index >= this.#middlewares.length) return
        const mw = this.#middlewares[index]
        try {
          this.#logger.debug(`middleware ${index - 1} of ws_msg#${hash} start`)
          await mw(ctx, async (): Promise<void> => { await next(index + 1) })
          this.#logger.debug(`middleware ${index - 1} of ws_msg#${hash} end`)
        } catch (err: any) {
          this.#logger.error(`middleware ${index - 1} error: ${err.message}`)
          if (err instanceof Error) {
            this.#logger.error(err.stack)
          }
          // Then ignore error and continue to next middleware
          // Notice we don't need to catch error in next middleware
          // because it has already in a try-catch block
          next(index + 1).catch(() => {})
        }
      }
      this.#middlewares[0](ctx, async (): Promise<void> => { await next(1) })
        .catch(() => {}) // First middleware causes no error
    })
  }
}

function createMiddleware (mw: Middleware): Middleware {
  return mw
}

export default App
export { createMiddleware }
export type { Middleware, Job, MiddlewareCtx }
