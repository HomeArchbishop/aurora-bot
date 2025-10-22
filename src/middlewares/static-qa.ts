import { createDynamicSendMessageRequest, extractPureText } from '@/utils/onebot-utils'
import { createMiddleware } from 'aurorax'

export const staticQa = createMiddleware('staticQa', async (ctx, next) => {
  if (ctx.event.post_type !== 'message') {
    return await next()
  }

  const girlMatch = extractPureText(ctx.event.message).match(/(.*)变成小南娘了吗？/i)?.[1]?.trim()
  const yesNames = ['zc', 'xc']
  if (girlMatch) {
    ctx.send(createDynamicSendMessageRequest(ctx.event, [
      { type: 'text', data: { text: yesNames.includes(girlMatch) ? '是的喵' : '没有喵' } },
    ]))
    return
  }

  await next()
})
