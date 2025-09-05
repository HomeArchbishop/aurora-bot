import { createMiddleware } from '../app'

export const onlyEchoMe = createMiddleware(async (ctx, next) => {
  const event = ctx.event
  if (event.post_type === 'message' && event.message_type === 'private') {
    if (event.user_id === Number(process.env.MASTER_ID)) {
      ctx.send({
        action: 'send_private_msg',
        params: {
          user_id: event.user_id,
          message: '你是不是说了:' + event.raw_message,
        },
      })
      await next()
      return
    }
  }
  await next()
})
