import { createMiddleware } from '../app'

export const checkVersion = createMiddleware(async (ctx, next) => {
  const event = ctx.event
  if (event.post_type === 'message' && event.message_type === 'private') {
    if (event.user_id === Number(process.env.MASTER_ID) && event.raw_message === 'version') {
      ctx.send({
        action: 'send_private_msg',
        params: {
          user_id: event.user_id,
          message: `version: ${process.env.VERSION}\nbuild time: ${process.env.BUILD_TIME}`,
        },
      })
      // await next()
      return
    }
  }
  await next()
})
