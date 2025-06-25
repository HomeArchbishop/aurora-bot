import axios from 'axios'
import { createMiddleware, type MiddlewareCtx, type Middleware } from '../app'
import { Preset } from './preset'
import { type ApiRequest } from '../types/req'

interface EableGroupOptions { rate: number, replyOnAt: boolean }
interface EablePrivateOptions { rate: number }

enum ChatMode {
  Normal,
  SingleLineReply
}

type ReplyRequestSplits = string | Omit<ApiRequest, 'echo'>
type PresetPreprocessorFn = (preset: Preset) => Promise<void>
type ReplyProcessorFn = (splits: ReplyRequestSplits[]) => Promise<ReplyRequestSplits[]>

interface DBKey {
  history: string
  isShutup: string
  equipment: string
}

interface CommandCallbackCtx extends MiddlewareCtx {
  dbKey: DBKey
  textSegmentRequest: (str: string) => Omit<ApiRequest, 'echo'>
}
type CommandCallback = (ctx: CommandCallbackCtx, args: string[]) => Promise<void>
interface CommandOptions {
  permission: 'master' | 'everyone' | number[]
}

type ChatMiddlewareForkedArray = ChatMiddleware[] & { buildAll: () => Middleware[] }

class ChatMiddleware {
  constructor (id: string) {
    this.#id = id
  }

  readonly #id: string
  #preset: Preset = new Preset({ template: '' })
  readonly #enabled: Array<{ id: number, type: 'group' | 'private', rate: number, replyOnAt: boolean }> = []
  #allowNext: boolean = false
  #model?: string
  #chatMode: ChatMode = ChatMode.Normal
  #masters = new Set<number>()

  #presetHistoryInjectionCount: number = 70
  readonly #presetPreprocessors: PresetPreprocessorFn[] = []
  readonly #replyProcessors: ReplyProcessorFn[] = []

  readonly #commands: Array<{ command: RegExp[], permission: CommandOptions['permission'], callback: CommandCallback }> = []

  usePreset (preset: Preset): this {
    this.#preset = preset.clone()
    return this
  }

  useModel (model: string): this {
    this.#model = model
    return this
  }

  useMaster (masterId: number): this {
    this.#masters.add(masterId)
    return this
  }

  enableGroup (groupId: number, options: EableGroupOptions = { rate: 0, replyOnAt: true }): this {
    this.#enabled.push({ id: groupId, type: 'group', rate: options.rate, replyOnAt: options.replyOnAt })
    return this
  }

  enablePrivate (userId: number, options: EablePrivateOptions = { rate: 1 }): this {
    this.#enabled.push({ id: userId, type: 'private', rate: options.rate, replyOnAt: true })
    return this
  }

  allowNext (): this {
    this.#allowNext = true
    return this
  }

  useChatMode (mode: ChatMode): this {
    this.#chatMode = mode
    return this
  }

  setPresetHistoryInjectionCount (cnt: number): this {
    this.#presetHistoryInjectionCount = cnt
    return this
  }

  addPresetPreprocessor (fn: PresetPreprocessorFn): this {
    this.#presetPreprocessors.push(fn)
    return this
  }

  addReplyProcessor (fn: ReplyProcessorFn): this {
    this.#replyProcessors.push(fn)
    return this
  }

  addCommand (command: string | RegExp | Array<string | RegExp>, cb: CommandCallback, options: CommandOptions): this {
    this.#commands.push({
      command: (Array.isArray(command) ? command : [command]).map(cmd => {
        if (typeof cmd === 'string') {
          return new RegExp(`^${cmd.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|\\s)`)
        }
        return cmd
      }),
      permission: options.permission,
      callback: cb
    })
    return this
  }

  fork (): ChatMiddleware
  fork (handlers: Array<(mw: ChatMiddleware) => ChatMiddleware>): ChatMiddlewareForkedArray
  fork (handlers?: Array<(mw: ChatMiddleware) => ChatMiddleware>): ChatMiddlewareForkedArray | ChatMiddleware {
    const forkOnce = (i: number): ChatMiddleware => {
      const newMw = new ChatMiddleware(`${this.#id}_fork_${i}`)
      newMw.#preset = this.#preset.clone()
      newMw.#model = this.#model
      newMw.#enabled.push(...this.#enabled)
      newMw.#allowNext = this.#allowNext
      newMw.#chatMode = this.#chatMode
      newMw.#masters = new Set(this.#masters)
      newMw.#presetHistoryInjectionCount = this.#presetHistoryInjectionCount
      newMw.#presetPreprocessors.push(...this.#presetPreprocessors)
      newMw.#replyProcessors.push(...this.#replyProcessors)
      newMw.#commands.push(...this.#commands)
      return newMw
    }
    if (handlers === undefined) {
      return forkOnce(1)
    }
    const arr = handlers.map((handler, i) => handler(forkOnce(i + 1)))
    Object.defineProperty(arr, 'buildAll', {
      value () {
        return this.map((mw: ChatMiddleware) => mw.build())
      },
      writable: false,
      enumerable: false,
      configurable: true
    })
    return arr as ChatMiddlewareForkedArray
  }

  get bubble (): this { return this }

  async #completions (messages: Array<Record<'role' | 'content', string>>): Promise<string> {
    if (this.#model === undefined) {
      throw new Error('Model is not set')
    }
    const resp = await axios.request({
      url: process.env.CHATBOT_LLM_API_HOST + '/v1/chat/completions',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${process.env.CHATBOT_LLM_API_KEY}`,
        'User-Agent': 'PoloAPI/1.0.0 (https://poloai.top)',
        'Content-Type': 'application/json'
      },
      data: {
        model: this.#model,
        messages
      }
    })
    return resp.data.choices[0].message.content.trim()
  }

  get mw (): Middleware {
    return createMiddleware(async (mwCtx, next) => {
      const { event, db, send } = mwCtx
      if (event.post_type !== 'message') {
        await next()
        return
      }
      const isBeenAt = event.message.find(seg => seg.type === 'at' && seg.data.qq === `${event.self_id}`) !== undefined
      const isFromMaster = this.#masters.has(event.user_id)
      const isGroup = event.message_type === 'group'
      const eventId = isGroup ? event.group_id : event.user_id
      const enableHit = this.#enabled.find(({ id, type }) => id === eventId && type === event.message_type)
      if (enableHit === undefined) {
        await next()
        return
      }
      const dbKey: DBKey = {
        history: `chatbot:${this.#id}:history:${event.message_type}_${eventId}`,
        isShutup: `chatbot:${this.#id}:shutup:${event.message_type}_${eventId}`,
        equipment: `chatbot:${this.#id}:equipment:${event.message_type}_${eventId}`
      }
      const isShutup = db.getSync(dbKey.isShutup) === 'true'
      // Define tool functions
      const textSegmentRequest = (str: string): Omit<ApiRequest, 'echo'> => ({
        action: event.message_type === 'group' ? 'send_group_msg' : 'send_private_msg',
        params: {
          [event.message_type === 'group' ? 'group_id' : 'user_id']: eventId,
          message: str
        }
      })
      const updateHistoryToDb = async (comingMsg: string, isSelf: boolean): Promise<[string, string]> => {
        const formerHistory = db.getSync(dbKey.history) ?? ''
        const timenow = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
        const senderNickname = (isGroup ? event.sender.card : event.sender.nickname) ?? 'unknown'
        const updatedHistoryPiece = isSelf
          ? `(real_you,你,id[${event.self_id}],msgid[unknown],time[${timenow}]): ${comingMsg}`
          : `(others,nickname[${senderNickname}],id[${event.user_id}],msgid[${event.message_id}],time[${timenow}]): ${comingMsg}`
        const newHistory = `${formerHistory}\n${updatedHistoryPiece}`
        await db.put(dbKey.history, newHistory)
        return [formerHistory, updatedHistoryPiece]
      }
      // Handle Commands
      const rawMessage = event.message.filter(seg => seg.type === 'text').map(seg => seg.data.text).join('').trim()
      for (const cmd of this.#commands) {
        if (!cmd.command.some(reg => reg.test(rawMessage))) { continue }
        if (cmd.permission === 'master' && !isFromMaster) {
          send(textSegmentRequest('没有权限执行该命令'))
          return
        } else if (Array.isArray(cmd.permission) && !cmd.permission.includes(event.user_id) && !isFromMaster) {
          send(textSegmentRequest('没有权限执行该命令'))
          return
        }
        const ctx: CommandCallbackCtx = {
          ...mwCtx,
          dbKey,
          textSegmentRequest
        }
        const args = rawMessage.split(/\s/).slice(1).map(arg => arg.trim()).filter(arg => arg.length > 0)
        await cmd.callback.call(this, ctx, args)
        return
      }
      // Save the coming message to db
      const message = event.message.reduce<string[]>((acc, seg) => {
        if (seg.type === 'text') {
          acc.push(seg.data.text)
        } else if (seg.type === 'at') {
          acc.push(`@${seg.data.qq}`)
        }
        return acc
      }, []).join(' ').trim()
      if (message.length === 0) {
        if (this.#allowNext) { await next() }
        return
      }
      const [formerHistory, updatedHistoryPiece] = await updateHistoryToDb(message, false)
      // Check if ignore message this time
      if (isShutup || !((enableHit.replyOnAt && isBeenAt) || (Math.random() < enableHit.rate))) {
        if (this.#allowNext) { await next() }
        return
      }
      // Not ignore, then handle the message
      try {
        const preset = this.#preset.clone()
        preset.addReplaceOnce([/{{history_injection}}/g,
          formerHistory.split('\n').slice(-this.#presetHistoryInjectionCount).join('\n')])
        preset.addReplaceOnce([/{{equipment}}/g, db.getSync(dbKey.equipment) ?? '(no equipment)'])
        for (const preprocessor of this.#presetPreprocessors) {
          await preprocessor(preset)
        }
        const replyString = await this.#completions([
          { role: 'system', content: preset.prompt },
          { role: 'user', content: updatedHistoryPiece }
        ])
        const splits = await this.#replyProcessors.reduce<Promise<ReplyRequestSplits[]>>(
          async (acc, processor) => await acc.then(async res => await processor(res)),
          Promise.resolve(replyString.split('\n').map(l => l.trim()).filter(l => l.length > 0))
        )
          .then(res => res.map(split =>
            typeof split === 'string' ? split.split('\n').map(l => l.trim()).filter(l => l.length > 0) : split))
          .then(res => res.flat())
        if (this.#chatMode === ChatMode.Normal) {
          for (const split of splits) {
            // split is NEVER an empty string
            const sleepTime = ~~(Math.random() * 1000) + 500
            if (typeof split !== 'string') {
              send(split)
              await Bun.sleep(sleepTime)
              continue
            }
            send(textSegmentRequest(split))
            await Bun.sleep(sleepTime)
          }
        } else if (this.#chatMode === ChatMode.SingleLineReply) {
          send(textSegmentRequest(
            `[CQ:reply,id=${event.message_id}][CQ:at,qq=${event.user_id}] ${splits.filter(split => typeof split === 'string').join('\n')}`))
        }
        // Save the reply to db
        const selfComingMsg = splits.filter(split => typeof split === 'string').join(' ')
        await updateHistoryToDb(selfComingMsg, true)
      } catch (err: any) {
        send(textSegmentRequest('发生错误' + err.message))
      }
    })
  }

  build (): Middleware {
    return this.mw
  }
}

export {
  ChatMiddleware,
  ChatMode
}
