import { isPrivateFrom } from '@/extensions/gate'
import { SiliconflowKeyUsage } from '@/extensions/llm'
import { createMiddleware } from 'aurorax'

export const checkKeyUsage = createMiddleware('checkKeyUsage', async (ctx, next) => {
  const event = ctx.event
  if (!isPrivateFrom(event, process.env.MASTER_ID) || !['keys', 'key'].includes(event.raw_message)) {
    return await next()
  }
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
})
