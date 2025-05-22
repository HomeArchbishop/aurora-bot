import { createMiddleware } from '../app'

export const checkConn = createMiddleware(async (ctx, next) => {
  const event = ctx.event
  if (event.post_type === 'message' && event.message_type === 'private') {
    if (event.user_id === Number(process.env.MASTER_ID) && event.raw_message === 'ping') {
      ctx.send({
        action: 'send_private_msg',
        params: {
          user_id: event.user_id,
          message: 'pong!'
        }
      })
      // await next()
      return
    }
  }
  await next()
})
