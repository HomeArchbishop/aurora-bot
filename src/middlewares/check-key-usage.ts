import { createMiddleware } from 'aurorax'
import { SiliconflowKeyUsage } from '@/extensions/llm'

export const checkKeyUsage = createMiddleware('checkKeyUsage', async (ctx, next) => {
  const event = ctx.event
  if (event.post_type === 'message' && event.message_type === 'private') {
    if (event.user_id === Number(process.env.MASTER_ID) && ['keys', 'key'].includes(event.raw_message)) {
      const keys = process.env.LLM_API_KEYS.split(',').map(key => key.trim())
      const status = await SiliconflowKeyUsage.usage(process.env.LLM_API_HOST, keys)
      ctx.send({
        action: 'send_private_msg',
        params: {
          user_id: event.user_id,
          message: [
            '#\tkey   \tbalance',
            ...status.map((s, i) => {
              return `${i}\t${keys[i].slice(0, 6)}\t${s.balance}`
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
