import { createDynamicSendMessageRequest, createMessageSend, extractPureText } from '@/utils/onebot-utils'
import { createMiddleware } from 'aurorax'

export const taffyLiveAsk = createMiddleware('taffyLiveAsk', async (ctx, next) => {
  if (ctx.event.post_type !== 'message') {
    return await next()
  }

  const queries = [
    'taffy直播了吗',
    'taffy 直播了吗',
    '永雏塔菲直播了吗',
    '塔菲直播了吗',
    '塔菲在直播吗',
    '塔菲在不在直播',
    '塔菲在不在播',
    '永',
  ].map(query => ([
    `${query}?`,
    `${query}？`,
  ])).flat()

  if (!queries.includes(extractPureText(ctx.event.message))) {
    return await next()
  }

  const response = await fetch('https://api.live.bilibili.com/room/v1/Room/get_info?room_id=22603245')
  const data = await response.json()
  const isLive = data.data.live_status === 1

  const message = isLive
    ? createMessageSend([
      { type: 'text', data: { text: 'taffy 正在直播喵\n' } },
      { type: 'text', data: { text: 'https://live.bilibili.com/22603245\n' } },
      { type: 'image', data: { file: data.data.user_cover } },
    ])
    : createMessageSend([
      { type: 'text', data: { text: '不在直播喵' } },
    ])
  ctx.send(createDynamicSendMessageRequest(ctx.event, message))
})
