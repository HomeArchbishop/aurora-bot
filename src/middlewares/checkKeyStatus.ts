import { createMiddleware } from '../app'
import { LLM } from '../llm/llm'

export const checkKeyStatus = createMiddleware(async (ctx, next) => {
  const event = ctx.event
  if (event.post_type === 'message' && event.message_type === 'private') {
    if (event.user_id === Number(process.env.MASTER_ID) && ['keys', 'key'].includes(event.raw_message)) {
      const keys = process.env.LLM_API_KEYS.split(',')
      const llm = new LLM({
        apiHost: process.env.LLM_API_HOST,
        keys,
        model: '',
      })
      const status = await Promise.allSettled(keys.map(async (key, i) => {
        try {
          const usage = await llm.usage(i)
          return {
            keyIndex: i,
            key: key.slice(0, 6),
            balance: usage.balance ?? '/',
          }
        } catch (err: any) {
          throw new Error(String(err.message ?? err))
        }
      }))
      ctx.send({
        action: 'send_private_msg',
        params: {
          user_id: event.user_id,
          message: [
            '#\tkey   \tbalance',
            ...status.map((s, i) => {
              if (s.status === 'fulfilled') {
                const data = s.value
                return `${data.keyIndex}\t${data.key}\t${data.balance}`
              }
              const error = s.reason as Error
              return `${i}\t${keys[i]}\tError - ${error.message}`
            }),
          ].join('\n'),
        },
      })
      // await next()
      return
    }
  }
  await next()
})
