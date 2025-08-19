import { type MiddlewareCtx, type DBKey } from './share.types'
import { type LLM } from '../llm/llm'
import { type ApiRequest } from '../types/req'
import { type ChatMiddleware } from './chat'

type CommandPattern = string | RegExp | Array<string | RegExp>
interface CommandCallbackCtx extends MiddlewareCtx {
  dbKey: DBKey
  llm?: LLM
  textSegmentRequest: (str: string) => Omit<ApiRequest, 'echo'>
}
type CommandCallback = (this: ChatMiddleware, ctx: CommandCallbackCtx, args: string[]) => Promise<void>
interface CommandOptions {
  permission: 'master' | 'everyone' | number[]
}
interface Command {
  command: RegExp[]
  permission: CommandOptions['permission']
  callback: CommandCallback
}
type CommandRegistrar = (command: Command) => ChatMiddleware
type CommandRegistry = Array<Command>

/**
 * @internal
 * Used in `ChatMiddleware` to create a command registrar function
 * @param commandRegistry - The command registry to register the command to
 * @returns A command registrar function
 */
function createCommandRegistrar (this: ChatMiddleware, commandRegistry: CommandRegistry): CommandRegistrar {
  return (command) => {
    commandRegistry.push(command)
    return this
  }
}

/**
 * Util function to create a command
 * @param command - The command to create
 * @param cb - The callback function
 * @param options - The options for the command
 * @returns A command
 */
function createCommand (
  pattern: CommandPattern, cb: CommandCallback, options: CommandOptions
): Command {
  return {
    command: (Array.isArray(pattern) ? pattern : [pattern]).map(cmd => {
      if (typeof cmd === 'string') {
        return new RegExp(`^${cmd.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|\\s)`)
      }
      return cmd
    }),
    permission: options.permission,
    callback: cb
  }
}

export type {
  CommandCallbackCtx, CommandRegistrar, CommandRegistry
}

export {
  createCommandRegistrar, // internal
  createCommand
}
