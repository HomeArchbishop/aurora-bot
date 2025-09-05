import { createMiddleware } from '../app'

export const tiichermateController = createMiddleware(async (ctx, next) => {
  const event = ctx.event
  if (event.post_type === 'message' && event.message_type === 'private') {
    if (event.user_id === Number(process.env.MASTER_ID) && event.raw_message.match(/https:\/\/tiichermate\..*\?.*openid=\w+/i) !== null) {
      const openid = event.raw_message.match(/openid=(\w+)(&|$)/i)?.[1]
      const api = event.raw_message.match(/api=(.+?)(&|$)/i)?.[1]
      if (openid === undefined || api === undefined) {
        ctx.send({
          action: 'send_private_msg',
          params: {
            user_id: event.user_id,
            message: 'openid/api未找到',
          },
        })
        await next()
        return
      }
      process.env.TIICHERMATE_OPENID = openid
      process.env.TIICHERMATE_API = api
      ctx.send({
        action: 'send_private_msg',
        params: {
          user_id: event.user_id,
          message: `已注册\n[openid] ${openid}\n[api] ${api}`,
        },
      })
      await next()
      return
    }
    if (event.user_id === Number(process.env.MASTER_ID) && event.raw_message === 'tq') {
      delete process.env.TIICHERMATE_OPENID
      delete process.env.TIICHERMATE_API
      ctx.send({
        action: 'send_private_msg',
        params: {
          user_id: event.user_id,
          message: '已注销tiichemate',
        },
      })
    }
  }
  await next()
})
