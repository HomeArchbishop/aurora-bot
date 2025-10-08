import axios from 'axios'
import type { LlmPlatform, LlmInputMessage } from './interface'
import { OpenaiAdapter, SiliconflowAdapter, type PlatformAdapter } from './internal/platform-adapters'
import { type KeyObject, KeyPool } from './internal/key-pool'

interface LlmOptions {
  platform: LlmPlatform
  apiHost: string
  keys: string[]
  model: string
  temperature?: number
  topP?: number
  additionalHeaders?: Record<string, string>
}

export class LLM {
  #isInitialized: boolean = false

  readonly #keys: string[]
  readonly #keyPool: KeyPool
  readonly #platform: LlmPlatform
  readonly #apiHost: string
  readonly #model: string
  readonly #temperature: number
  readonly #topP: number
  readonly #additionalHeaders: Record<string, string>
  readonly #adapter: PlatformAdapter

  constructor ({
    platform,
    apiHost,
    keys,
    model,
    temperature = 0.7,
    topP = 1.0,
    additionalHeaders = {},
  }: LlmOptions) {
    this.#platform = platform
    this.#apiHost = apiHost
    this.#keys = keys
    this.#keyPool = new KeyPool(keys)
    this.#model = model
    this.#temperature = temperature
    this.#topP = topP
    this.#additionalHeaders = additionalHeaders
    this.#adapter = this.#initializeAdapter(platform)
    this.#isInitialized = true
  }

  #initializeAdapter (platform: LlmPlatform): PlatformAdapter {
    switch (platform) {
      case 'siliconflow':
        return new SiliconflowAdapter()
      case 'openai':
      default:
        return new OpenaiAdapter()
    }
  }

  getPlatform (): LlmPlatform {
    return this.#platform
  }

  getKeyStatuses (): KeyObject[] {
    return this.#keyPool.getKeyStatuses()
  }

  /* ==================== [Start] Completions ==================== */
  async completions (messages: LlmInputMessage[]): Promise<string> {
    this.#validateCompletionsRequest()
    const { key, keyIndex } = this.#selectRandomKey()
    try {
      const resp = await this.#makeCompletionsRequest(key, messages)
      this.#keyPool.markValid(keyIndex)
      return resp.data.choices[0].message.content.trim()
    } catch (err: any) {
      const error = this.#handleCompletionsError(err, key, keyIndex)
      if (error === 'retry') {
        return this.completions(messages)
      }
      throw error
    }
  }

  #validateCompletionsRequest (): void {
    if (!this.#isInitialized) {
      throw new Error('LLM is not initialized. Please wait for initialization to complete.')
    }
    if (this.#model === undefined) {
      throw new Error('Model is not set')
    }
  }

  #selectRandomKey (): { key: string; keyIndex: number } {
    const okKeys = this.#keyPool.getValidKeys()
    if (okKeys.length === 0) {
      throw new Error('No valid API keys available')
    }
    const keyIndexOfValid = Math.floor(Math.random() * okKeys.length)
    const keyObject = okKeys[keyIndexOfValid]
    return { key: keyObject.key, keyIndex: keyObject.keyIndex }
  }

  async #makeCompletionsRequest (key: string, messages: LlmInputMessage[]) {
    return await this.#adapter.completions({
      apiHost: this.#apiHost,
      key,
      additionalHeaders: this.#additionalHeaders,
      data: {
        model: this.#model,
        messages,
        temperature: this.#temperature,
        topP: this.#topP,
      },
    })
  }

  #handleCompletionsError (err: any, key: string, keyIndex: number): Error | 'retry' {
    if (axios.isAxiosError(err) && err.response !== undefined) {
      const message = `@llmCompletionsRequest [${err.message}] ${err.response.data.message ?? ''}`
      if (err.response.status === 401 /* Invalid API Key */ || err.response.status === 403 /* No Balance */) {
        this.#keyPool.markInvalid(keyIndex)
        return 'retry'
      }
      return new Error(`${message} (key: #${keyIndex} ${key.slice(0, 6)}...)`)
    }
    return new Error(`@llmCompletionsRequest ${err?.message ?? String(err)}`)
  }
  /* ==================== [End] Completions ==================== */

  clone (): LLM {
    return new LLM({
      platform: this.#platform,
      apiHost: this.#apiHost,
      keys: this.#keys,
      model: this.#model,
      temperature: this.#temperature,
      topP: this.#topP,
      additionalHeaders: { ...this.#additionalHeaders },
    })
  }
}
