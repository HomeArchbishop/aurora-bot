import { createReplyDecorator, type ReplyRequestSplit } from '@/extensions/chat'
import { generateVoiceMinimax } from '@/services/voice-gen/minimax'
import { createDynamicSendMessageRequest } from '@/utils/onebot-utils'

export const replyDecorator = createReplyDecorator(async (splits, ctx) => {
  const processedSplits = [] as ReplyRequestSplit[]
  for (const split of splits) {
    if (typeof split !== 'string') {
      processedSplits.push(split)
      continue
    }
    const tools = [...split.matchAll(/\[tool="(.*?)"(.*?)\]/g)]
    let finalStr = split
    for (const tool of tools) {
      const toolName = tool[1]
      if (toolName === 'at') {
        const atId = tool[2].match(/id="(.*?)"/)
        if (atId !== null) {
          finalStr = finalStr.replace(tool[0], `[CQ:at,qq=${atId[1]}]`)
        }
      }
      if (toolName === 'taffy-voice') {
        const text = tool[2].match(/text="(.*?)"/)?.[1] ?? ''
        if (text === null) {
          continue
        }
        const { buffer } = await generateVoiceMinimax({
          text,
          voiceId: 'voice_497db616-b807-4baa-8b2a-283c2355b7ad',
        })
        const base64 = buffer.toString('base64')
        finalStr = finalStr.replace(tool[0], '')
        if ('spec' in ctx.event) { continue }
        processedSplits.push(createDynamicSendMessageRequest(ctx.event, [
          { type: 'record', data: { file: `data:audio/wav;base64,${base64}` } },
        ]))
        continue
      }
    }
    processedSplits.push(finalStr)
  }
  return processedSplits
})
