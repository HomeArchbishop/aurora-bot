import { createMiddleware } from 'aurorax'

export const reportConnect = createMiddleware(async (ctx, next) => {
  const event = ctx.event
  if (event.post_type === 'meta_event' && event.meta_event_type === 'lifecycle' && event.sub_type === 'connect') {
    ctx.send({
      action: 'send_private_msg',
      params: {
        user_id: Number(process.env.MASTER_ID),
        message: 'connected喵',
      },
    })
  }
  await next()
})
