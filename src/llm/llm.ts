import axios from 'axios'

interface LLMOptions {
  apiHost: string
  keys: string[]
  model: string
  temperature?: number
  topP?: number
  additionalHeaders?: Record<string, string>
}

enum LLM_PLATFORM {
  SILICONFLOW
}

interface LLMUsage {
  keyIndex: number
  key: string
  balance?: string
}

type LLMKeyStatus = 'ok' | 'bad' | 'unknown'

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
    // Do initialization
    Promise.allSettled([
      // Initialize key status
      this.refreshKeyStatus()
    ])
      .then(() => {
        // Mark the LLM as initialized
        this.#isInitialized = true
      })
      .catch(() => {})
  }

  #isInitialized: boolean = false

  readonly #apiHost: string
  readonly #keys: string[]

  readonly #model: string
  readonly #temperature: number
  readonly #topP: number

  readonly #additionalHeaders: Record<string, string>

  #keyStatus: LLMKeyStatus[] = []

  get #platform (): LLM_PLATFORM {
    if (this.#apiHost.includes('siliconflow.cn')) {
      return LLM_PLATFORM.SILICONFLOW
    }
    throw new Error(`Unrecognized API platform for host: ${this.#apiHost}`)
  }

  #buildURL (endpoint: string): string {
    return new URL(endpoint, this.#apiHost).toString()
  }

  async completions (messages: Array<Record<'role' | 'content', string>>): Promise<string> {
    if (!this.#isInitialized) {
      throw new Error('LLM is not initialized. Please wait for initialization to complete.')
    }
    if (this.#model === undefined) {
      throw new Error('Model is not set')
    }
    const okKeys = this.#keys.filter((_, i) => this.#keyStatus[i] === 'ok')
    if (okKeys.length === 0) {
      throw new Error('No valid API keys available')
    }
    const keyIndex = Math.floor(Math.random() * okKeys.length)
    const key = okKeys[keyIndex]
    try {
      const resp = await axios.request({
        url: this.#buildURL('/v1/chat/completions'),
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${key}`,
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
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response !== undefined) {
        if (err.response.status >= 400 && err.response.status < 500) {
          throw new Error(`@llmCompletionsRequest [${err.message}] ${err.response.data.message ?? ''} (key: #${keyIndex} ${key.slice(0, 6)}...)`)
        } else {
          throw new Error(`@llmCompletionsRequest [${err.message}] ${err.response.data.message ?? ''}`)
        }
      } else {
        throw new Error(`@llmCompletionsRequest ${err?.message ?? String(err)}`)
      }
    }
  }

  async usage (keyIndex: number): Promise<LLMUsage> {
    const key = this.#keys[keyIndex]
    if (key === undefined) {
      throw new Error(`No key found for index ${keyIndex}`)
    }
    const url = {
      [LLM_PLATFORM.SILICONFLOW]: this.#buildURL('/v1/user/info')
    }[this.#platform]
    if (url === undefined) {
      throw new Error(`Unsupported platform: ${this.#platform}`)
    }
    try {
      const resp = await axios.request({
        url,
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          ...this.#additionalHeaders
        }
      })
      if (this.#platform === LLM_PLATFORM.SILICONFLOW) {
        return {
          keyIndex,
          key,
          balance: `${resp.data.data.balance}r`
        }
      }
      throw new Error('')
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response !== undefined) {
        throw new Error(`@llmUsageRequest [${err.message}] ${err.response.data.message ?? ''} (key: #${keyIndex} ${key.slice(0, 6)}...)`)
      } else {
        throw new Error(`@llmUsageRequest ${err?.message ?? String(err)}`)
      }
    }
  }

  async refreshKeyStatus (): Promise<void> {
    await Promise.allSettled(this.#keys.map(async (_, i) => {
      await this.usage(i)
        .then(usage => { this.#keyStatus[i] = (usage.balance !== undefined && parseFloat(usage.balance) > 0) ? 'ok' : 'bad' })
        .catch(() => { this.#keyStatus[i] = 'unknown' })
    }))
  }

  getKeyStatus (): LLMKeyStatus[] {
    return this.#keyStatus
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
