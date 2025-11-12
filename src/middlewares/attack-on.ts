import { createDynamicSendMessageRequest, extractPureText } from '@/utils/onebot-utils'
import { createMiddleware } from 'aurorax'

const GROUP_IDS = [process.env.MISC_GROUP_ID_KINDERGARTEN, process.env.MISC_GROUP_ID_NEW528]
const MASTER_ID = process.env.MASTER_ID

export const attackOn = createMiddleware('attackOn', async (ctx, next) => {
  const event = ctx.event
  if (event.post_type !== 'message') {
    return await next()
  }
  const groupHit = event.message_type === 'group' && GROUP_IDS.includes(`${event.group_id}`)
  const privateHit = event.message_type === 'private' && event.user_id === Number(MASTER_ID)
  const instruction = extractPureText(event.message).trim()
  const args = instruction.split(/\s+/)
  const attackOnHit = /^attackOn/.test(instruction)
  const targetQQ = args[1]
  const hit = (groupHit || privateHit) && attackOnHit && targetQQ
  if (!hit) {
    return await next()
  }

  // const pairs: string[][] = []
  // args.forEach((arg) => {
  //   if (arg.startsWith('-')) {
  //     pairs.push([])
  //   }
  //   const activePair = pairs.at(-1)
  //   if (activePair) {
  //     activePair.push(arg)
  //   }
  // })

  ctx.send(createDynamicSendMessageRequest(event, [
    { type: 'at', data: { qq: targetQQ } },
    { type: 'text', data: { text: 'sb' } },
  ]))
})
