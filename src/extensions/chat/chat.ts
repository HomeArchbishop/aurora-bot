import { createMiddleware } from 'aurorax'
import type { MessageEvent, Middleware } from 'aurorax'
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
  type ChatbotOnebotContext,
  type ChatbotContext,
} from './interface'
import { filterEmptySplits, pureTextRequest } from './utils'
import { splitAndTrimAndFilterEmpty } from '@/utils/string'
import type { CtxSend } from 'aurorax/dist/internal/onebot-bridge/interface'

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
  enableGroup (groupId: number, options: EnableGroupOptions = { rate: 0, replyOnMention: true }): this {
    this.#enabled.push({ id: groupId, type: 'group', rate: options.rate, replyOnMention: options.replyOnMention })
    return this
  }

  @constructionLog
  enablePrivate (userId: number, options: EnablePrivateOptions = { rate: 1 }): this {
    this.#enabled.push({ id: userId, type: 'private', rate: options.rate, replyOnMention: true })
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

  getCommandHelpString (): string {
    return [...this.#superCommands, ...this.#commands]
      .reduce((acc, cmd) => {
        const pattern = cmd.pattern.map(reg => reg.source.replace(/^\^/, '').replace(/\$$/, '')).join('|')
        acc += `${pattern} ${cmd.description ?? ''}\n`
        return acc
      }, '')
  }

  get bubble (): this { return this }

  #getBuilderConditions () {
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

  /* --- Chat Logic 对话内部逻辑 [Begin] --- */

  #isMentioned (event: MessageEvent) {
    return event.message.some(seg => seg.type === 'at' && seg.data.qq === `${event.self_id}`)
  }

  #isFromMaster (event: MessageEvent) {
    return this.#masters.has(event.user_id)
  }

  #getEventId (event: MessageEvent) {
    return event.message_type === 'group' ? event.group_id : event.user_id
  }

  #hitEnable (event: MessageEvent) {
    return this.#enabled.find(({ id, type }) => id === this.#getEventId(event) && type === event.message_type)
  }

  #buildDbKey (event: MessageEvent) {
    return {
      history: `chatbot:${this.#id}:history:${event.message_type}_${this.#getEventId(event)}`,
      isShutup: `chatbot:${this.#id}:shutup:${event.message_type}_${this.#getEventId(event)}`,
      equipment: `chatbot:${this.#id}:equipment:${event.message_type}_${this.#getEventId(event)}`,
    }
  }

  #buildChatbotContext (event: MessageEvent, send: CtxSend): ChatbotContext {
    const { db, llm, preset } = this.#getBuilderConditions()
    const isMentioned = this.#isMentioned(event)
    const isFromMaster = this.#isFromMaster(event)
    const isGroup = event.message_type === 'group'
    const eventId = this.#getEventId(event)
    const enableHit = this.#hitEnable(event)
    const dbKey = this.#buildDbKey(event)
    const isShutup = db.getSync(dbKey.isShutup) === 'true'
    return {
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
        isMentioned,
        enableHit,
        isShutup,
        text: pureTextRequest.bind(null, eventId, isGroup),
        flags: {},
      },
    }
  }

  #buildHistoryPiece (event: MessageEvent, comingMsg: string, isSelf: boolean) {
    const timenow = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    const senderNickname = (event.message_type === 'group' ? event.sender.card : event.sender.nickname) ?? 'unknown'
    const historyPiece = isSelf
      ? `(real_you,你,id[${event.self_id}],msgid[unknown],time[${timenow}]): ${comingMsg}`
      : `(others,nickname[${senderNickname}],id[${event.user_id}],msgid[${event.message_id}],time[${timenow}]): ${comingMsg}`
    return historyPiece
  }

  async #updateHistoryToDb (event: MessageEvent, comingMsg: string, isSelf: boolean) {
    const { db } = this.#getBuilderConditions()
    const dbKey = this.#buildDbKey(event)
    const formerHistory = db.getSync(dbKey.history) ?? ''
    const historyPiece = this.#buildHistoryPiece(event, comingMsg, isSelf)
    const newHistory = `${formerHistory}\n${historyPiece}`
    await db.put(dbKey.history, newHistory)
  }

  #hasPermission (event: MessageEvent, cmd: Command): boolean {
    if (cmd.permission === 'master') {
      return this.#isFromMaster(event)
    }
    if (Array.isArray(cmd.permission)) {
      return cmd.permission.includes(event.user_id) || this.#isFromMaster(event)
    }
    return true
  }

  #hitCommand (event: MessageEvent, commandRegistry: Command[]) {
    const rawMessage = event.raw_message.trim()
    return commandRegistry.find(cmd => cmd.pattern.some(reg => reg.test(rawMessage)))
  }

  #parseCommandArgs (event: MessageEvent) {
    const rawMessage = event.raw_message.trim()
    return splitAndTrimAndFilterEmpty(rawMessage, /\s/).slice(1)
  }

  async #handleCommands (ctx: ChatbotOnebotContext, commandRegistry: Command[]): Promise<boolean> {
    const cmd = this.#hitCommand(ctx.event, commandRegistry)
    if (cmd === undefined) { return false }
    if (!this.#hasPermission(ctx.event, cmd)) {
      ctx.send(ctx.domain.text('没有权限执行该命令'))
      return true
    }
    const args = this.#parseCommandArgs(ctx.event)
    await cmd.callback.call(this, ctx, args)
    return true
  }

  #shouldIgnoreMessage (event: MessageEvent) {
    const { db } = this.#getBuilderConditions()
    const dbKey = this.#buildDbKey(event)
    const isShutup = db.getSync(dbKey.isShutup) === 'true'
    const isMentioned = this.#isMentioned(event)
    const enableHit = this.#hitEnable(event)!
    return isShutup || !((enableHit.replyOnMention && isMentioned) || (Math.random() < enableHit.rate))
  }

  /* --- Chat Logic 对话内部逻辑 [End] --- */

  buildMiddleware (): Middleware {
    return createMiddleware(`chatbot:${this.#id}`, async ({ event, send }, next) => {
      if (event.post_type !== 'message') { return await next() }

      const ctx = this.#buildChatbotContext(event, send) as ChatbotOnebotContext

      const { domain } = ctx // use domain for convenience

      // Handle super commands
      if (await this.#handleCommands(ctx, this.#superCommands)) { return }
      // Check if is hit
      if (domain.enableHit === undefined) { return await next() }
      // Handle Commands
      if (await this.#handleCommands(ctx, this.#commands)) { return }

      const messageString = await this.#messageStringParser(ctx)
      if (!messageString) { return }

      // Save the coming message to db
      await this.#updateHistoryToDb(event, messageString, false)

      // Check if ignore message this time
      if (this.#shouldIgnoreMessage(event)) { return }

      // Not ignore, then handle the message
      try {
        const { llm, preset } = this.#getBuilderConditions()
        // Decorate the prompt
        // - add time, history, equipment, etc.
        const prompt = await this.#promptDecorator(preset.prompt, ctx)

        // Generate the reply
        const replyString = await llm.completions([
          { role: 'system', content: prompt },
          { role: 'user', content: this.#buildHistoryPiece(event, messageString, false) },
        ])

        const rawSplits = splitAndTrimAndFilterEmpty(replyString, '\n')

        const decoratedSplits = await this.#replyDecorator(rawSplits, ctx)

        const wrappedRequestSplits = filterEmptySplits(decoratedSplits)
          .map(split => typeof split === 'string' ? ctx.domain.text(split) : split)

        if (this.#chatMode === ChatMode.Normal) {
          for (const split of wrappedRequestSplits) {
            // split is NEVER an empty string
            const sleepTime = ~~(Math.random() * 1000) + 500
            send(split)
            await Bun.sleep(sleepTime)
          }
        } else if (this.#chatMode === ChatMode.SingleLineReply) {
          const str = `[CQ:reply,id=${event.message_id}][CQ:at,qq=${event.user_id}] ${rawSplits.join('\n')}`
          send(ctx.domain.text(str))
        }

        // Save the reply to db
        const selfComingMsg = rawSplits.join(' ')
        await this.#updateHistoryToDb(event, selfComingMsg, true)
      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        const str = `error@plugin:chatbot:${this.#id}${errorMessage.startsWith('@') ? '' : ' '}${errorMessage}`
        send(ctx.domain.text(str))
      }
    })
  }
}
