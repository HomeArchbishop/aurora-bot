import { isPrivateFrom } from '@/extensions/gate'
import { createMiddleware } from 'aurorax'

export const checkConn = createMiddleware('checkConn', async (ctx, next) => {
  const event = ctx.event
  if (!isPrivateFrom(event, process.env.MASTER_ID) || event.raw_message !== 'ping') {
    return await next()
  }
  ctx.send({
    action: 'send_private_msg',
    params: {
      user_id: event.user_id,
      message: 'pong!',
    },
  })
})
