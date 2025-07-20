interface WebhookServerState {
  isStarted: boolean
}

interface WebhookTriggerCtx {
  query: URLSearchParams
  body: ArrayBuffer
}
type WebhookTrigger = (ctx: WebhookTriggerCtx) => Promise<void>

class WebhookServer {
  #isStarted: boolean = false
  #port: number = 3000
  #token?: string
  readonly #webhookTiggerMap = new Map<string, WebhookTrigger>()

  getState (): WebhookServerState {
    return { isStarted: this.#isStarted }
  }

  setPort (port: number): this {
    if (this.#isStarted) {
      throw new Error('Cannot change port while server is running')
    }
    this.#port = port
    return this
  }

  setToken (token?: string): this {
    this.#token = token
    return this
  }

  start (): void {
    if (this.#isStarted) {
      throw new Error('Webhook server is already started')
    }
    Bun.serve({
      port: this.#port,
      routes: {
        '/webhook/:webhookId': {
          POST: async (req: Bun.BunRequest<'/webhook/:webhookId'>) => {
            if (this.#token !== undefined && req.headers.get('Authorization') !== `Bearer ${this.#token}`) {
              return new Response('Unauthorized', { status: 401 })
            }
            const { webhookId } = req.params
            const webhookTrigger = this.#webhookTiggerMap.get(webhookId)
            if (webhookTrigger === undefined) {
              return new Response('Webhook not found', { status: 404 })
            }
            const url = new URL(req.url)
            const params = url.searchParams // query parameters
            const body = await req.arrayBuffer()
            // Process the webhook request here
            try {
              await webhookTrigger({ query: params, body })
            } catch (err) {
              return new Response('Webhook processing error: ' + String(err), { status: 500 })
            }
            return new Response('Webhook processed successfully', { status: 200 })
          }
        }
      },
      fetch () {
        return new Response('Not Found', { status: 404 })
      }
    })
    this.#isStarted = true
  }

  useTrigger (webhookId: string, trigger: WebhookTrigger): void {
    if (this.#webhookTiggerMap.has(webhookId)) {
      throw new Error(`Webhook trigger for ${webhookId} already exists`)
    }
    this.#webhookTiggerMap.set(webhookId, trigger)
  }
}

export { WebhookServer }
export type { WebhookTriggerCtx }
