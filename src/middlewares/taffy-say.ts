import { generateVoiceMinimax } from '@/services/voice-gen/minimax'
import { createDynamicSendMessageRequest, extractPureText } from '@/utils/onebot-utils'
import { createMiddleware } from 'aurorax'
import minimist from 'minimist'
import { promisify } from '@/utils/promisify'

const MASTER_ID = process.env.MASTER_ID
const GROUP_IDS = [process.env.MISC_GROUP_ID_KINDERGARTEN, process.env.MISC_GROUP_ID_NEW528]

export const taffySay = createMiddleware('taffySay', async (ctx, next) => {
  const event = ctx.event
  if (event.post_type !== 'message') {
    return await next()
  }
  const privateHit = event.message_type === 'private' && event.user_id === Number(MASTER_ID)
  const groupHit = event.message_type === 'group' && GROUP_IDS.includes(`${event.group_id}`)
  const rawMessage = extractPureText(event.message).trim()
  const { _: [instruction, ...texts], 5: is528 } = minimist(rawMessage.split(' '), {
    boolean: ['5'],
    default: {
      5: false,
    },
  })
  const commandHit = instruction === '#taffy-say'
  const hit = (privateHit || groupHit) && commandHit
  if (!hit) {
    return await next()
  }

  const replySeg = event.message.find(x => x.type === 'reply')

  if (replySeg) {
    const replyMessage = await promisify(ctx.send)({
      action: 'get_msg',
      params: {
        message_id: +replySeg.data.id,
      },
    })
    const replyText = replyMessage.data.message.find(x => x.type === 'text')?.data.text
    if (replyText) {
      texts.length = 0
      texts.push(replyText)
    }
  }

  const text = texts.join(' ')

  // const isZc = event.user_id === 2261265112
  // if (isZc && Math.random() < 0.7) {
  //   text = specialText
  // }

  try {
    const { buffer, originalUrl } = await generateVoiceMinimax({ text, voiceId: 'voice_497db616-b807-4baa-8b2a-283c2355b7ad' })

    const base64 = buffer.toString('base64')
    const url = `data:audio/wav;base64,${base64}`

    if (is528) {
      ctx.send({
        action: 'send_group_msg',
        params: {
          group_id: Number(process.env.MISC_GROUP_ID_NEW528),
          message: [
            { type: 'record', data: { file: url } },
          ],
        },
      })
    }

    ctx.send(createDynamicSendMessageRequest(event, [
      { type: 'record', data: { file: url } },
    ]))

    ctx.send({
      action: 'send_private_msg',
      params: {
        user_id: Number(MASTER_ID),
        message: [
          { type: 'text', data: { text: `taffy-say ${text.slice(0, 100)}\nurl: ${originalUrl}` } },
        ],
      },
    })
  } catch (error) {
    ctx.send(createDynamicSendMessageRequest(event, [
      { type: 'reply', data: { id: `${event.message_id}` } },
      { type: 'text', data: { text: `taffy炸了: ${error instanceof Error ? error.message : String(error)}` } },
    ]))
  }
})
