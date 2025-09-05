import { createMiddleware } from '../app'

export const forwardEveryEmotion = createMiddleware(async (ctx, next) => {
  const event = ctx.event
  if (event.post_type === 'message' && event.message.find(seg => seg.type === 'image') !== undefined && event.message.find(seg => seg.type === 'image')?.data.sub_type === 1) {
    const from = event.message_type === 'group' ? `group ${event.group_id} ${event.sender.nickname}` : `private ${event.user_id} ${event.sender.nickname}`
    ctx.send({
      action: 'send_private_msg',
      params: {
        user_id: Number(process.env.MASTER_ID),
        message: `from ${from} ${event.raw_message}`,
      },
    })
    return
  }
  await next()
})
