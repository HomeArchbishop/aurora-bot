import axios from 'axios'
import { createMiddleware, type Middleware } from '../app'
import { Preset } from './preset'
import { type ApiRequest } from '../types/api'

interface ChatMiddlewareHooksRecord {
  beforeCompletions: (preset: Preset, history: string) => Promise<Preset>
  beforeSend: (replyString: string) => Promise<Array<string | Omit<ApiRequest, 'echo'>>>
  historyPieceText: (splits: Array<string | Omit<ApiRequest, 'echo'>>) => Promise<string>
}

interface EableGroupOptions { rate: number, replyOnAt: boolean }
interface EablePrivateOptions { rate: number }

class ChatMiddleware {
  constructor (id: string) {
    this.#id = id
  }

  readonly #id: string
  #preset: Preset = new Preset({ template: '' })
  readonly #enabled: Array<{ id: number, type: 'group' | 'private', rate: number, replyOnAt: boolean }> = []
  #allowNext: boolean = false
  #model?: string

  readonly #masters = new Set<number>()

  readonly #hooks: ChatMiddlewareHooksRecord = {
    beforeCompletions: async (preset, history) =>
      preset.addReplaceOnce([/{{history_injection}}/g, history.split('\n').slice(-100).join('\n')]),
    beforeSend: async replyString =>
      replyString.split('\n').filter(split => split.trim().length > 0),
    historyPieceText: async splits =>
      splits.filter(split => typeof split === 'string').join(' ')
  }

  usePreset (preset: Preset): this {
    this.#preset = preset.clone()
    return this
  }

  useModel (model: string): this {
    this.#model = model
    return this
  }

  useHooks (hook: Partial<ChatMiddlewareHooksRecord>): this {
    this.#hooks.beforeCompletions = hook.beforeCompletions ?? this.#hooks.beforeCompletions
    this.#hooks.beforeSend = hook.beforeSend ?? this.#hooks.beforeSend
    this.#hooks.historyPieceText = hook.historyPieceText ?? this.#hooks.historyPieceText
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

  async #completions (messages: Array<Record<'role' | 'content', string>>): Promise<string> {
    if (this.#model === undefined) {
      throw new Error('Model is not set')
    }
    const resp = await axios.request({
      url: process.env.POLO_API_HOST + '/v1/chat/completions',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${process.env.POLO_API_KEY}`,
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
    return createMiddleware(async ({ event, db, send }, next) => {
      if (event.post_type !== 'message') {
        await next()
        return
      }
      const isGroup = event.message_type === 'group'
      const eventId = isGroup ? event.group_id : event.user_id
      const enableHit = this.#enabled.find(({ id, type }) => id === eventId && type === event.message_type)
      if (enableHit === undefined) {
        await next()
        return
      }
      const dbKey = {
        history: `chatbot:${this.#id}:history:${event.message_type}_${eventId}`
      }
      // Define tool functions
      const textSegmentRequest = (msg: string): Omit<ApiRequest, 'echo'> => ({
        action: event.message_type === 'group' ? 'send_group_msg' : 'send_private_msg',
        params: {
          [event.message_type === 'group' ? 'group_id' : 'user_id']: eventId,
          message: msg
        }
      })
      // Handle Commands
      const rawMessage = event.message.filter(seg => seg.type === 'text').map(seg => seg.data.text).join('').trim()
      if (this.#masters.has(event.user_id)) {
        if (rawMessage === '#clearhistory') {
          await db.del(dbKey.history)
          send(textSegmentRequest('已清除历史记录'))
          return
        }
        if (rawMessage === '#history') {
          const formerHistory = db.getSync(dbKey.history) ?? '[无聊天记录]'
          if (formerHistory.trim() === '') {
            send(textSegmentRequest('[无聊天记录]'))
            return
          }
          send(textSegmentRequest(formerHistory.split(/\n/).slice(-50).join('\n')))
          return
        }
        if (rawMessage.startsWith('#delhistory')) {
          const formerHistory = db.getSync(dbKey.history)
          if (formerHistory === undefined) {
            send(textSegmentRequest('没有聊天记录可供删除'))
            return
          }
          const keywords = rawMessage.split(/\s/).slice(1).map(kw => `(${kw})`).join('|')
          const regex = new RegExp(keywords)
          const newHistory = formerHistory.split('\n')
            .filter(line => !regex.test(line.replace(/^\(.*?\):\s*/g, '').trim()))
            .join('\n')
          await db.put(dbKey.history, newHistory)
          send(textSegmentRequest(`已删去包含/${keywords}/的历史记录 ${formerHistory.split('\n').length - newHistory.split('\n').length} 条`))
          return
        }
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
      const formerHistory = db.getSync(dbKey.history) ?? ''
      const senderNickname = (isGroup ? event.sender.card : event.sender.nickname) ?? 'unknown'
      const timenow = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
      const appendHistoryPiece = `(others,nickname[${senderNickname}],id[${event.user_id}],msgid[${event.message_id}],time[${timenow}]): ${message}`
      const appendedHistory = `${formerHistory}\n${appendHistoryPiece}`
      await db.put(dbKey.history, appendedHistory)
      // Check if ignore message this time
      const isBeenAt = event.message.find(seg => seg.type === 'at' && seg.data.qq === `${event.self_id}`) !== undefined
      if (!((enableHit.replyOnAt && isBeenAt) || (Math.random() < enableHit.rate))) {
        if (this.#allowNext) { await next() }
        return
      }
      // Not ignore, then handle the message
      try {
        const preset = await this.#hooks.beforeCompletions(this.#preset.clone(), formerHistory)
        const replyString = await this.#completions([
          { role: 'system', content: preset.prompt },
          { role: 'user', content: appendHistoryPiece }
        ])
        const splits = await this.#hooks.beforeSend(replyString)
        for (const split of splits) {
          if (typeof split !== 'string') {
            send(split)
            continue
          }
          if (split.trim().length === 0) { continue }
          send(textSegmentRequest(split))
          await Bun.sleep(~~(Math.random() * 1000) + 500)
        }
        // Save the reply to db
        const historyPieceText = await this.#hooks.historyPieceText(splits)
        const newHistory = `${appendedHistory}\n(real_you,你,id[${event.self_id}],msgid[${event.message_id}],time[${timenow}]): ${historyPieceText}`
        await db.put(dbKey.history, newHistory)
      } catch (err: any) {
        send(textSegmentRequest('发生错误' + err.message))
      }
    })
  }
}

export {
  ChatMiddleware
}
