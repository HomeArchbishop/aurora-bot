import { createMiddleware } from '../app'
import { sendVNRelease } from '../shared/sendVNDB'

export const vnReleaseEvent = createMiddleware(async (ctx, next) => {
  const event = ctx.event
  if (event.post_type === 'message' && /^#?vn(\s|$)/.test(event.raw_message)) {
    console.log(event.raw_message)
    const isGroup = event.message_type === 'group'
    const eventId = isGroup ? event.group_id : event.user_id
    const arg = event.raw_message.split(/\s+/)[1]
    const date = arg === undefined
      ? new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]
      : /^\d{8}$/.test(arg) || /^\d{4}$/.test(arg)
        ? arg
        : ''
    if (date === '') {
      ctx.send({
        action: isGroup ? 'send_group_msg' : 'send_private_msg',
        params: {
          user_id: eventId,
          group_id: eventId,
          message: '日期格式错误，请使用 YYYYMMDD 格式'
        }
      })
      return
    }
    ctx.send({
      action: isGroup ? 'send_group_msg' : 'send_private_msg',
      params: {
        user_id: eventId,
        group_id: eventId,
        message: `正在获取 ${date} 的发布信息，请稍候...`
      }
    })
    await sendVNRelease({ date, isGroup, eventId }, ctx)
    return
  }
  await next()
})
