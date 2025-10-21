import type { Context, CronEvent, OnebotEvent, ApiRequest, MessageEvent } from 'aurorax'
import type { Db } from '../db'
import type { Preset } from './preset'
import type { LLM } from '../llm'
import type { ChatbotBuilder } from './chat'

type NoEchoApiRequest = Omit<ApiRequest, 'echo'>

type ReplyRequestSplit = NoEchoApiRequest | string
type DBKey = Record<string, string>

/**
 * @export 对话模式
 */
export enum ChatMode {
  Normal, // 正常模式
  SingleLineReply, // 单行回复模式
}

/* ---------------------- */
/* Hook Options Interface */
/* ---------------------- */

/**
 * @internal 启用群组的 hook 参数
 */
export interface EnableGroupOptions {
  rate: number
  replyOnAt: boolean
}

/**
 * @internal 启用私聊的 hook 参数
 */
export interface EnablePrivateOptions {
  rate: number
}

/**
 * @internal 启用项，Builder 内部存储
 */
export interface EnableItem {
  id: number
  type: 'group' | 'private'
  rate: number
  replyOnAt: boolean
}

/**
 * @export 命令
 */
export interface Command {
  pattern: RegExp[]
  permission: 'master' | 'everyone' | number[]
  callback (this: ChatbotBuilder, ctx: ChatbotOnebotContext, args: string[]): Promise<void>
}

/**
 * @export 消息字符串解析器
 */
export type MessageStringParserFn = (ctx: ChatbotContext & { event: MessageEvent }) => Promise<string>

/**
 * @export 提示词装饰器
 */
export type PromptDecoratorFn = <T extends ChatbotContext>(prompt: string, ctx: T) => Promise<string>

/**
 * @export 回复装饰器
 */
export type ReplySplitDecoratorFn = (stringSplits: string[], ctx: ChatbotContext) => Promise<ReplyRequestSplit[]>

/* ----------------- */
/* Context Interface */
/* ----------------- */

/**
 * @internal chatbot context 拓展
 */
interface DomainPart {
  readonly db: Db
  readonly dbKey: DBKey
  readonly llm: LLM
  readonly preset: Preset
  readonly isGroup: boolean
  readonly eventId: number
  readonly isFromMaster: boolean
  readonly isBeenAt: boolean
  readonly enableHit?: EnableItem
  readonly isShutup: boolean
  readonly text: (str: string) => NoEchoApiRequest
  flags: Record<string, unknown>
}

/**
 * @internal onebot 上下文
 */
interface ChatbotOnebotContext extends Readonly<Context<OnebotEvent>> {
  event: MessageEvent
  domain: DomainPart
}

/**
 * @internal cron 上下文
 */
interface ChatbotCronContext extends Readonly<Context<CronEvent>> {
  domain: DomainPart
}

/**
 * @internal chatbot 上下文
 */
type ChatbotContext = ChatbotOnebotContext | ChatbotCronContext
