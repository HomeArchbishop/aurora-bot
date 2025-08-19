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
type CommandRegistrar = (command: CommandPattern, cb: CommandCallback, options: CommandOptions) => ChatMiddleware
type CommandRegistry = Array<{ command: RegExp[], permission: CommandOptions['permission'], callback: CommandCallback }>

/**
 * @internal
 * Used in `ChatMiddleware` to create a command registrar function
 * @param commandRegistry - The command registry to register the command to
 * @returns A command registrar function
 */
function createCommandRegistrar (this: ChatMiddleware, commandRegistry: CommandRegistry): CommandRegistrar {
  return (command, cb, options) => {
    commandRegistry.push({
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
}

/**
 * Util function to create a command
 * @param command - The command to create
 * @param cb - The callback function
 * @param options - The options for the command
 * @returns A command
 */
function createCommand (
  command: CommandPattern,
  cb: CommandCallback,
  options: CommandOptions
): [CommandPattern, CommandCallback, CommandOptions] {
  return [command, cb, options]
}

export type {
  CommandCallbackCtx, CommandRegistrar, CommandRegistry
}

export {
  createCommandRegistrar, // internal
  createCommand
}
