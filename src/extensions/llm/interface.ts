export enum LlmPlatform {
  OpenAI = 'openai',
  Anthropic = 'anthropic',
}

export interface LlmInputMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}
