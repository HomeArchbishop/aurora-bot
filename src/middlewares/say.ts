import { createDynamicSendMessageRequest, extractPureText } from '@/utils/onebot-utils'
import { createMiddleware } from 'aurorax'

const MASTER_ID = process.env.MASTER_ID

export const say = createMiddleware('say', async (ctx, next) => {
  const event = ctx.event
  if (event.post_type !== 'message') {
    return await next()
  }
  const privateHit = event.message_type === 'private' && event.user_id === Number(MASTER_ID)
  const instruction = extractPureText(event.message).trim()
  const commandHit = /^#say\s+(.*)/.test(instruction)
  const hit = privateHit && commandHit
  if (!hit) {
    return await next()
  }

  const text = instruction.split(' ').slice(1).join(' ')

  ctx.send(createDynamicSendMessageRequest(event, [
    { type: 'text', data: { text: '生成中' } },
  ]))

  try {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PPINFRA_API_TOKEN}`,
      },
      body: JSON.stringify({
        text,
        voice_setting: {
          speed: 1,
          vol: 1,
          pitch: 0,
          voice_id: 'danya_xuejie',
          emotion: 'angry',
          latex_read: true,
          text_normalization: true,
        },
      }),
    } as RequestInit

    const response = await fetch('https://api.ppio.com/v3/minimax-speech-02-hd', options)
    const data = await response.json()
    const audioUrl = data.audio

    ctx.send(createDynamicSendMessageRequest(event, [
      { type: 'reply', data: { id: `${event.message_id}` } },
      { type: 'text', data: { text: JSON.stringify(data, null, 2) } },
    ]))

    ctx.send(createDynamicSendMessageRequest(event, [
      { type: 'record', data: { file: audioUrl } },
    ]))
  } catch (error) {
    ctx.send(createDynamicSendMessageRequest(event, [
      { type: 'reply', data: { id: `${event.message_id}` } },
      { type: 'text', data: { text: `生成失败: ${error instanceof Error ? error.message : String(error)}` } },
    ]))
  }
})
