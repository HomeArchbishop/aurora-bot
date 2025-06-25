import { createMiddleware } from '../app'

export const onlyEchoMeAndSendID = createMiddleware(async (ctx, next) => {
  const event = ctx.event
  if (event.post_type === 'message' && event.message_type === 'private') {
    if (event.user_id === Number(process.env.MASTER_ID)) {
      ctx.send({
        action: 'send_private_msg',
        params: {
          user_id: event.user_id,
          message: '我echo：' + event.raw_message
        }
      }, (res) => {
        ctx.send({
          action: 'send_private_msg',
          params: {
            user_id: event.user_id,
            message: `你的ID是: ${res.data.message_id}`
          }
        })
      })
      await next()
      return
    }
  }
  await next()
})
