import type { Command, MessageStringParserFn, PromptDecoratorFn, ReplySplitDecoratorFn } from './interface'

/**
 * Util function to create a command
 * @returns A command
 */
export function createCommand (command: Command): Command {
  return command
}

/**
 * Util function to create a message string parser
 * @returns A message string parser
 */
export function createMessageStringParser (parser: MessageStringParserFn) {
  return parser
}

/**
 * Util function to create a prompt decorator
 * @returns A prompt decorator
 */
export const createPromptDecorator = (decorator: PromptDecoratorFn) => {
  return decorator
}

/**
 * Util function to create a reply decorator
 * @returns A reply decorator
 */
export const createReplyDecorator = (decorator: ReplySplitDecoratorFn) => {
  return decorator
}
