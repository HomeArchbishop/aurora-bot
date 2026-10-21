import { isUser } from '@/extensions/gate'
import { buildMorningReadMessage, fetchManifest } from '@/services/twomin-article'
import { createDynamicSendMessageRequest, extractPureText } from '@/utils/onebot-utils'
import { createMiddleware } from 'aurorax'
import { env } from 'bun'

const MASTER_ID = env.MASTER_ID

export const send2minArticleMw = createMiddleware('send2minArticleMw', async (ctx, next) => {
  const event = ctx.event
  if (!isUser(event, MASTER_ID) || extractPureText(event.message).trim() !== '#2min') {
    return await next()
  }

  try {
    const manifestItems = await fetchManifest()
    const latestTen = manifestItems.slice(0, 10)
    if (latestTen.length === 0) {
      ctx.send(createDynamicSendMessageRequest(event, [{ type: 'text', data: { text: '2min 暂无可用文章' } }]))
      return await next()
    }
    const randomArticle = latestTen[Math.floor(Math.random() * latestTen.length)]
    const text = await buildMorningReadMessage(randomArticle)
    ctx.send({
      action: 'send_private_msg',
      params: {
        user_id: Number(MASTER_ID),
        message: text,
      },
    })
  } catch (error) {
    ctx.send(createDynamicSendMessageRequest(event, [
      { type: 'reply', data: { id: `${event.message_id}` } },
      { type: 'text', data: { text: `2min 推送失败: ${error instanceof Error ? error.message : String(error)}` } },
    ]))
  }
})
