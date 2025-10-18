export type LlmPlatform = 'openai' | 'siliconflow'

export interface LlmInputMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}
