import axios from 'axios'

interface LLMOptions {
  apiHost: string
  keys: string[]
  model: string
  temperature?: number
  topP?: number
  additionalHeaders?: Record<string, string>
}

class LLM {
  constructor ({
    apiHost,
    keys,
    model,
    temperature = 0.7,
    topP = 1.0,
    additionalHeaders = {}
  }: LLMOptions) {
    this.#apiHost = apiHost
    this.#keys = keys
    this.#model = model
    this.#temperature = temperature
    this.#topP = topP
    this.#additionalHeaders = additionalHeaders
  }

  readonly #apiHost: string
  readonly #keys: string[]

  readonly #model: string
  readonly #temperature: number
  readonly #topP: number

  readonly #additionalHeaders: Record<string, string>

  #buildURL (endpoint: string): string {
    return new URL(endpoint, this.#apiHost).toString()
  }

  async completions (messages: Array<Record<'role' | 'content', string>>): Promise<string> {
    if (this.#model === undefined) {
      throw new Error('Model is not set')
    }
    try {
      const resp = await axios.request({
        url: this.#buildURL('/v1/chat/completions'),
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.#keys[Math.floor(Math.random() * this.#keys.length)]}`,
          'Content-Type': 'application/json',
          ...this.#additionalHeaders
        },
        data: {
          model: this.#model,
          messages,
          stream: false,
          temperature: this.#temperature,
          top_p: this.#topP
        }
      })
      return resp.data.choices[0].message.content.trim()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        throw new Error(`@llmRequest [${err.message}] ${err.response?.data?.message ?? ''}`)
      } else {
        throw new Error(`@llmRequest ${err instanceof Error ? err.message : String(err)}`)
      }
    }
  }

  clone (): LLM {
    return new LLM({
      apiHost: this.#apiHost,
      keys: this.#keys,
      model: this.#model,
      temperature: this.#temperature,
      topP: this.#topP,
      additionalHeaders: { ...this.#additionalHeaders }
    })
  }
}

export { LLM }
export type { LLMOptions }
