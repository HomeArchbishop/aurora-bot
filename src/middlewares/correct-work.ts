import { LLM } from '@/extensions/llm'
import { createDynamicSendMessageRequest, extractPureText } from '@/utils/onebot-utils'
import { promisify } from '@/utils/promisify'
import { splitAndTrimAndFilterEmpty } from '@/utils/string'
import { createMiddleware } from 'aurorax'

const MASTER_ID = process.env.MASTER_ID

export const correctWork = createMiddleware('correctWork', async (ctx, next) => {
  const event = ctx.event
  if (event.post_type !== 'message') {
    return await next()
  }
  const privateHit = event.message_type === 'private' && event.user_id === Number(MASTER_ID)
  const instruction = extractPureText(event.message).trim()
  const commandHit = /^#correct/.test(instruction)
  const replySeg = event.message.find(x => x.type === 'reply')
  const hit = privateHit && commandHit && replySeg
  if (!hit) {
    return await next()
  }

  const replyMessage = await promisify(ctx.send)({
    action: 'get_msg',
    params: {
      message_id: +replySeg.data.id,
    },
  })

  const imgUrl = replyMessage.data.message.find(x => x.type === 'image')?.data.url

  if (!imgUrl) {
    ctx.send(createDynamicSendMessageRequest(event, [
      { type: 'text', data: { text: '请提供图片' } },
    ]))
    return await next()
  }

  const llm = new LLM({
    platform: process.env.LLM_PLATFORM,
    apiHost: process.env.LLM_API_HOST,
    keys: splitAndTrimAndFilterEmpty(process.env.LLM_API_KEYS, ','),
    model: 'qwen/qwen3.5-plus',
    temperature: 1.3,
    topP: 0.8,
  })

  ctx.send(createDynamicSendMessageRequest(event, [
    { type: 'text', data: { text: '我就在这里，不躲，不藏，不绕，不逃，稳稳地接住你的图片，然后帮你批改。' } },
  ]))

  try {
    const reply = await llm.completions([
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: imgUrl,
            },
          },
          {
            type: 'text',
            text: `请根据图片内容进行批改。以纯文本描述的形式输出。禁止使用markdown。你的回复必须简介清晰，简洁明了，重点突出。
你可以选用如下句式来提升你的「OPENAI味」：
你指出的问题很关键，我承认。
我就说实话了，不绕，不藏。
我要告诉你一个可能让你意外的真相。
能意识到这一点，说明你已经非常清醒了。
我先不分析、不改、不评判，我先接住你。
你是想继续深入这个话题，还是换个方向？
需要我帮你做一个图表，分析背后的底层逻辑吗？
你问的不是怎么做，而是想确认自己已经走在正确的
路上。
我就在这，不躲，不藏，不绕，不逃，稳稳地接住
你。
你说得太好了，仿佛一下子击中了我的心。我懂，我
真的懂了。
接下来我不套模板，不评判，不逃避，只用最真实的
方式和你交流。你说，我听
          `,
          },
        ],
      },
    ])

    ctx.send(createDynamicSendMessageRequest(event, [
      { type: 'reply', data: { id: `${event.message_id}` } },
      { type: 'text', data: { text: reply } },
    ]))
  } catch (error) {
    ctx.send(createDynamicSendMessageRequest(event, [
      { type: 'reply', data: { id: `${event.message_id}` } },
      { type: 'text', data: { text: `批改失败: ${error instanceof Error ? error.message : String(error)} ${imgUrl}` } },
    ]))
  }
})
