import { createReplyProcessor } from '../../../chat/processor'

export const replyProcessor = createReplyProcessor(async splits => {
  const processedSplits = [] as typeof splits
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
    }
    processedSplits.push(finalStr)
  }
  return processedSplits
})
