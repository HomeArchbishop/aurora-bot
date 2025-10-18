import { createMiddleware } from 'aurorax'
import type { Middleware } from 'aurorax'
import type { Db } from '@/extensions/db'
import { Preset } from './preset'
import type { LLM } from '@/extensions/llm'
import {
  type EnableGroupOptions,
  type EnablePrivateOptions,
  type EnableItem,
  type Command,
  type PromptDecoratorFn,
  type ReplySplitDecoratorFn,
  ChatMode,
  type MessageStringParserFn,
} from './interface'
import { pureTextRequest } from './utils'

type ChatbotBuilderForkedArray = ChatbotBuilder[] & { buildAll: () => Middleware[] }

type InstanceMethodTuple<T, Ex = never> = {
  [Name in Exclude<keyof T, Ex>]: T[Name] extends (...args: Array<infer Arg>) => infer Return ? [Name, Arg[], Return] : never;
}[Exclude<keyof T, Ex>]
type ConstructionLogItem = InstanceMethodTuple<ChatbotBuilder, 'recordConstructionLog'>
function constructionLog (_target: any, propertyName: string | symbol, descriptor: PropertyDescriptor): void {
  const method = descriptor.value
  descriptor.value = function (this: ChatbotBuilder, ...args: ConstructionLogItem): ConstructionLogItem[2] {
    // console.log(`🔗 Chain: ${this._callChain.join(' -> ')}`)
    const result = method.apply(this, args)
    this.recordConstructionLog([propertyName, args, result] as ConstructionLogItem)
    return result
  }
}

export class ChatbotBuilder {
  readonly #id: string

  #chatMode: ChatMode = ChatMode.Normal

  readonly #masters = new Set<number>()
  readonly #enabled: Array<EnableItem> = []

  readonly #superCommands: Command[] = []
  readonly #commands: Command[] = []

  #preset?: Preset
  #llm?: LLM
  #db?: Db

  #messageStringParser: MessageStringParserFn = async (ctx) => ctx.event.raw_message
  #promptDecorator: PromptDecoratorFn = async (prompt, ctx) => prompt
  #replyDecorator: ReplySplitDecoratorFn = async (splits) => splits

  /**
   * @internal
   * Used to record the construction log
   */
  readonly #constructionLog: ConstructionLogItem[] = []

  constructor (id: string) {
    this.#id = id
  }

  @constructionLog
  usePreset (preset: Preset): this {
    this.#preset = preset.clone()
    return this
  }

  @constructionLog
  useLLM (llm: LLM): this {
    this.#llm = llm
    return this
  }

  @constructionLog
  useDb (db: Db): this {
    this.#db = db
    return this
  }

  @constructionLog
  useMaster (masterId: number): this {
    this.#masters.add(masterId)
    return this
  }

  @constructionLog
  enableGroup (groupId: number, options: EnableGroupOptions = { rate: 0, replyOnAt: true }): this {
    this.#enabled.push({ id: groupId, type: 'group', rate: options.rate, replyOnAt: options.replyOnAt })
    return this
  }

  @constructionLog
  enablePrivate (userId: number, options: EnablePrivateOptions = { rate: 1 }): this {
    this.#enabled.push({ id: userId, type: 'private', rate: options.rate, replyOnAt: true })
    return this
  }

  @constructionLog
  useChatMode (mode: ChatMode): this {
    this.#chatMode = mode
    return this
  }

  @constructionLog
  useSuperCommand (command: Command): this {
    this.#superCommands.push(command)
    return this
  }

  @constructionLog
  useCommand (command: Command): this {
    this.#commands.push(command)
    return this
  }

  @constructionLog
  useMessageStringParser (parser: MessageStringParserFn): this {
    this.#messageStringParser = parser
    return this
  }

  @constructionLog
  usePromptDecorator (decorator: PromptDecoratorFn): this {
    this.#promptDecorator = decorator
    return this
  }

  @constructionLog
  useReplyDecorator (fn: ReplySplitDecoratorFn): this {
    this.#replyDecorator = fn
    return this
  }

  fork (): ChatbotBuilder
  fork (handlers: Array<(mw: ChatbotBuilder) => ChatbotBuilder>): ChatbotBuilderForkedArray

  @constructionLog
  fork (handlers?: Array<(mw: ChatbotBuilder) => ChatbotBuilder>): ChatbotBuilderForkedArray | ChatbotBuilder {
    const forkOnce = (i: number): ChatbotBuilder => {
      const newMw = new ChatbotBuilder(`${this.#id}_fork_${i}`)
      newMw.#preset = this.#preset?.clone()
      newMw.#llm = this.#llm?.clone()
      newMw.#db = this.#db
      newMw.#enabled.push(...this.#enabled)
      newMw.#chatMode = this.#chatMode
      this.#masters.forEach(master => newMw.#masters.add(master))
      newMw.#commands.push(...this.#commands)
      newMw.#superCommands.push(...this.#superCommands)
      newMw.#messageStringParser = this.#messageStringParser
      newMw.#promptDecorator = this.#promptDecorator
      newMw.#replyDecorator = this.#replyDecorator
      newMw.#constructionLog.push(...this.#constructionLog)
      return newMw
    }
    if (handlers === undefined) {
      return forkOnce(1)
    }
    const arr = handlers.map((handler, i) => handler(forkOnce(i + 1)))
    Object.defineProperty(arr, 'buildAll', {
      value () {
        return this.map((mw: ChatbotBuilder) => mw.buildMiddleware())
      },
      writable: false,
      enumerable: false,
      configurable: true,
    })
    return arr as ChatbotBuilderForkedArray
  }

  recordConstructionLog (logItem: ConstructionLogItem): void {
    this.#constructionLog.push(logItem)
  }

  get bubble (): this { return this }

  #checkBuilderCondition () {
    if (this.#db === undefined) {
      throw new Error('Db is not set')
    }
    if (this.#llm === undefined) {
      throw new Error('LLM is not set')
    }
    if (this.#preset === undefined) {
      throw new Error('Preset is not set')
    }
    return { db: this.#db, llm: this.#llm, preset: this.#preset }
  }

  buildMiddleware (): Middleware {
    const { db, llm, preset } = this.#checkBuilderCondition()
    return createMiddleware(`chatbot:${this.#id}`, async ({ event, send }, next) => {
      if (event.post_type !== 'message') {
        return await next()
      }
      const isBeenAt = event.message.find(seg => seg.type === 'at' && seg.data.qq === `${event.self_id}`) !== undefined
      const isFromMaster = this.#masters.has(event.user_id)
      const isGroup = event.message_type === 'group'
      const eventId = isGroup ? event.group_id : event.user_id
      const enableHit = this.#enabled.find(({ id, type }) => id === eventId && type === event.message_type)
      const dbKey = {
        history: `chatbot:${this.#id}:history:${event.message_type}_${eventId}`,
        isShutup: `chatbot:${this.#id}:shutup:${event.message_type}_${eventId}`,
        equipment: `chatbot:${this.#id}:equipment:${event.message_type}_${eventId}`,
      }
      const isShutup = db.getSync(dbKey.isShutup) === 'true'
      const ctx = {
        send,
        event,
        domain: {
          db,
          dbKey,
          llm,
          preset,
          isGroup,
          eventId,
          isFromMaster,
          isBeenAt,
          enableHit,
          isShutup,
          text: pureTextRequest.bind(null, eventId, isGroup),
          flags: {},
        },
      }
      // Define tool functions
      const createHistoryPiece = (comingMsg: string, isSelf: boolean): string => {
        const timenow = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
        const senderNickname = (isGroup ? event.sender.card : event.sender.nickname) ?? 'unknown'
        const historyPiece = isSelf
          ? `(real_you,你,id[${event.self_id}],msgid[unknown],time[${timenow}]): ${comingMsg}`
          : `(others,nickname[${senderNickname}],id[${event.user_id}],msgid[${event.message_id}],time[${timenow}]): ${comingMsg}`
        return historyPiece
      }
      const updateHistoryToDb = async (comingMsg: string, isSelf: boolean) => {
        const formerHistory = db.getSync(dbKey.history) ?? ''
        const historyPiece = createHistoryPiece(comingMsg, isSelf)
        const newHistory = `${formerHistory}\n${historyPiece}`
        await db.put(dbKey.history, newHistory)
      }
      const handleCommands = async (commandRegistry: Command[]): Promise<boolean> => {
        const rawMessage = event.raw_message.trim()
        for (const cmd of commandRegistry) {
          if (!cmd.pattern.some(reg => reg.test(rawMessage))) { continue }
          if (cmd.permission === 'master' && !isFromMaster) {
            send(ctx.domain.text('没有权限执行该命令'))
            return true
          } else if (Array.isArray(cmd.permission) && !cmd.permission.includes(event.user_id) && !isFromMaster) {
            send(ctx.domain.text('没有权限执行该命令'))
            return true
          }
          const args = rawMessage.split(/\s/).slice(1).map(arg => arg.trim()).filter(arg => arg.length > 0)
          await cmd.callback.call(this, ctx, args)
          return true
        }
        return false
      }
      // Handle super commands
      if (await handleCommands(this.#superCommands)) { return }
      // Check if is hit
      if (enableHit === undefined) {
        return await next()
      }
      // Handle Commands
      if (await handleCommands(this.#commands)) { return }
      // Save the coming message to db
      const message = await this.#messageStringParser(ctx)
      if (message.length === 0) {
        return
      }
      await updateHistoryToDb(message, false)
      // Check if ignore message this time
      if (isShutup || !((enableHit.replyOnAt && isBeenAt) || (Math.random() < enableHit.rate))) {
        return
      }
      // Not ignore, then handle the message
      try {
        const prompt = await this.#promptDecorator(preset.prompt, ctx)
        const replyString = await llm.completions([
          { role: 'system', content: prompt },
          { role: 'user', content: createHistoryPiece(message, false) },
        ])
        const splits = replyString.split('\n').map(l => l.trim()).filter(l => l.length > 0)
        const decoratedSplits = await this.#replyDecorator(splits, ctx)
        const wrappedSplits = decoratedSplits
          .map(split => typeof split === 'string' ? split.trim() : split)
          .filter(Boolean)
          .map(split => typeof split === 'string' ? ctx.domain.text(split) : split)
        if (this.#chatMode === ChatMode.Normal) {
          for (const split of wrappedSplits) {
            // split is NEVER an empty string
            const sleepTime = ~~(Math.random() * 1000) + 500
            if (typeof split !== 'string') {
              send(split)
              await Bun.sleep(sleepTime)
              continue
            }
            send(ctx.domain.text(split))
            await Bun.sleep(sleepTime)
          }
        } else if (this.#chatMode === ChatMode.SingleLineReply) {
          send(ctx.domain.text(
            `[CQ:reply,id=${event.message_id}][CQ:at,qq=${event.user_id}] ${splits.filter(split => typeof split === 'string').join('\n')}`))
        }
        // Save the reply to db
        const selfComingMsg = splits.filter(split => typeof split === 'string').join(' ')
        await updateHistoryToDb(selfComingMsg, true)
      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        send(ctx.domain.text(`error@plugin:chatbot:${this.#id}${errorMessage.startsWith('@') ? '' : ' '}${errorMessage}`))
      }
    })
  }
}
