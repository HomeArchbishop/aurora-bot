import type { AxiosResponse } from 'axios'
import type { LlmInputMessage } from '@/extends/llm/interface'

export interface AdapterCompletionsParams {
  apiHost: string
  key: string
  additionalHeaders?: Record<string, string>
  data: {
    model: string
    messages: LlmInputMessage[]
    temperature?: number
    topP?: number
  }
}

export interface PlatformAdapter {
  completions (params: AdapterCompletionsParams): Promise<AxiosResponse>
}
