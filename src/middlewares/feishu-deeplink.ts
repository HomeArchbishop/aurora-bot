import { createDynamicSendMessageRequest, extractPureText } from '@/utils/onebot-utils'
import { createMiddleware } from 'aurorax'

export const feishuDeeplink = createMiddleware('feishuDeeplink', async (ctx, next) => {
  if (ctx.event.post_type !== 'message') {
    return await next()
  }

  const matches = extractPureText(ctx.event.message).match(/https:\/\/.*feishu\.cn\/wiki\/[^\s]+/i)?.[0]

  if (!matches) {
    return await next()
  }

  const deepLink = `https://applink.feishu.cn/client/docs/open?url=${matches}`

  ctx.send(createDynamicSendMessageRequest(ctx.event, [
    { type: 'text', data: { text: '🔗 监测到飞书文档链接，已自动转为 deep link\n' } },
    { type: 'text', data: { text: '(仅供移动端使用，请点击后在右上角「…」菜单中用浏览器打开)\n' } },
    { type: 'text', data: { text: deepLink } },
  ]))

  await next()
})
