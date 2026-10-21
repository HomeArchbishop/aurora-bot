import { isPrivateFrom } from '@/extensions/gate'
import { createMiddleware } from 'aurorax'

export const checkVersion = createMiddleware('checkVersion', async (ctx, next) => {
  const event = ctx.event
  if (!isPrivateFrom(event, process.env.MASTER_ID) || event.raw_message !== 'version') {
    return await next()
  }
  ctx.send({
    action: 'send_private_msg',
    params: {
      user_id: event.user_id,
      message: `version: ${process.env.VERSION}\nbuild time: ${process.env.BUILD_TIME}`,
    },
  })
})
