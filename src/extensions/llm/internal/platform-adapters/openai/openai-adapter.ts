import axios, { type AxiosResponse } from 'axios'
import type { AdapterCompletionsParams, PlatformAdapter } from '@/extensions/llm/internal/platform-adapters/interface'
import { buildUrl } from '@/utils/url'

export class OpenaiAdapter implements PlatformAdapter {
  async completions (params: AdapterCompletionsParams): Promise<AxiosResponse> {
    return await axios.request({
      url: buildUrl(params.apiHost, 'chat/completions'),
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${params.key}`,
        'Content-Type': 'application/json',
        ...params.additionalHeaders,
      },
      data: {
        model: params.data.model,
        messages: params.data.messages,
        stream: false,
        temperature: params.data.temperature,
        top_p: params.data.topP,
      },
    })
  }
}
