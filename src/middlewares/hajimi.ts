import { decryptText, encryptText } from '@/services/hatimi'
import { createDynamicSendMessageRequest, extractPureText } from '@/utils/onebot-utils'
import { promisify } from '@/utils/promisify'
import { createMiddleware } from 'aurorax'

const GROUP_IDS = [process.env.MISC_GROUP_ID_KINDERGARTEN, process.env.MISC_GROUP_ID_NEW528]
const MASTER_ID = process.env.MASTER_ID

export const hajimi = createMiddleware(async (ctx, next) => {
  const event = ctx.event
  if (event.post_type !== 'message') {
    return await next()
  }
  if (event.message[0].type !== 'reply') {
    return await next()
  }
  const groupHit = event.message_type === 'group' && GROUP_IDS.includes(`${event.group_id}`)
  const privateHit = event.message_type === 'private' && event.user_id === Number(MASTER_ID)
  const instruction = extractPureText(event.message).trim()
  const encodeHit = [/^hajimi!/, /^hajimi！/].some(regex => regex.test(instruction))
  const decodeHit = [/^hajimi\?/, /^hajimi？/].some(regex => regex.test(instruction))
  const hit = (groupHit || privateHit) && (encodeHit || decodeHit)
  if (!hit) {
    return await next()
  }
  const replyMessage = await promisify(ctx.send)({
    action: 'get_msg',
    params: {
      message_id: +event.message[0].data.id,
    },
  })
  const hajimiText = replyMessage.data.raw_message
  const text = encodeHit ? encryptText(hajimiText) : decryptText(hajimiText)
  const p = encodeHit ? '加密⬇' : '解密⬇'
  if (!text) { return await next() }
  ctx.send(createDynamicSendMessageRequest(event, p))
  await Bun.sleep(200)
  ctx.send(createDynamicSendMessageRequest(event, text))
})
