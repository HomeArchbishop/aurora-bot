import { createDynamicSendMessageRequest, extractPureText } from '@/utils/onebot-utils'
import { createMiddleware, type MessageSegmentSend } from 'aurorax'

const GROUP_IDS = [process.env.MISC_GROUP_ID_KINDERGARTEN, process.env.MISC_GROUP_ID_NEW528]
const MASTER_ID = process.env.MASTER_ID

export const delegateMsg = createMiddleware('delegateMsg', async (ctx, next) => {
  const event = ctx.event
  if (event.post_type !== 'message') {
    return await next()
  }
  const groupHit = event.message_type === 'group' && GROUP_IDS.includes(`${event.group_id}`)
  const privateHit = event.message_type === 'private' && event.user_id === Number(MASTER_ID)
  const instruction = extractPureText(event.message).trim()
  const args = instruction.split(/\s+/)
  const delegateMsgHit = /^delegate/.test(instruction)
  const message = args[1]
  const isMessageValid = message && message.length > 0 && !message.startsWith('-')
  const hit = (groupHit || privateHit) && delegateMsgHit && isMessageValid
  if (!hit) {
    return await next()
  }

  const pairs: string[][] = []
  args.forEach((arg) => {
    if (arg.startsWith('-')) {
      pairs.push([])
    }
    const activePair = pairs.at(-1)
    if (activePair) {
      activePair.push(arg)
    }
  })

  const targetQQ = pairs.find(pair => pair[0] === '--at' || pair[0] === '-a')?.slice(1) ?? []
  const repeatTimes = pairs.find(pair => pair[0] === '--repeat' || pair[0] === '-r')?.slice(1) ?? 1
  const actualRepeatTimes = Math.min(Number(repeatTimes), 10)

  for (let i = 0; i < actualRepeatTimes; i++) {
    ctx.send(createDynamicSendMessageRequest(event, [
      ...targetQQ.map(qq => ({ type: 'at', data: { qq } })) as MessageSegmentSend[],
      ...(message.length > 0 ? [{ type: 'text', data: { text: ' ' } }] as MessageSegmentSend[] : []),
      { type: 'text', data: { text: message } },
    ]))
    if (i < actualRepeatTimes - 1) {
      await Bun.sleep(200)
    }
  }
})
