import { LLM } from '@/extensions/llm'
import { createDynamicSendMessageRequest, extractPureText } from '@/utils/onebot-utils'
import { promisify } from '@/utils/promisify'
import { splitAndTrimAndFilterEmpty } from '@/utils/string'
import { createMiddleware } from 'aurorax'

const MASTER_ID = process.env.MASTER_ID
const GROUP_IDS = [process.env.MISC_GROUP_ID_KINDERGARTEN, process.env.MISC_GROUP_ID_NEW528]

export const whatsFuckingThis = createMiddleware('whatsFuckingThis', async (ctx, next) => {
  const event = ctx.event
  if (event.post_type !== 'message') {
    return await next()
  }
  const privateHit = event.message_type === 'private' && event.user_id === Number(MASTER_ID)
  const groupHit = event.message_type === 'group' && GROUP_IDS.includes(`${event.group_id}`)
  const instruction = extractPureText(event.message).trim()
  const commandHit = /^#what/.test(instruction)
  const replySeg = event.message.find(x => x.type === 'reply')
  const hit = (privateHit || groupHit) && commandHit && replySeg
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
    { type: 'text', data: { text: '我就在这里，不躲，不藏，不绕，不逃，稳稳地接住你的图片，然后帮你看看这是什么东西。' } },
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
            text: `请根据图片内容进行分析。以纯文本描述的形式输出。禁止使用markdown。你的回复必须简介清晰，简洁明了，重点突出。
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
      { type: 'text', data: { text: `分析失败: ${error instanceof Error ? error.message : String(error)} ${imgUrl}` } },
    ]))
  }
})
