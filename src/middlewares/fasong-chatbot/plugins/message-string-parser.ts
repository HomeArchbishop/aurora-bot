import { createMessageStringParser } from '@/extensions/chat'

export const messageStringParser = createMessageStringParser(async ({ event, domain }) => {
  const message = event.message.reduce<string[]>((acc, seg) => {
    if (seg.type === 'text') {
      acc.push(seg.data.text)
    } else if (seg.type === 'at') {
      acc.push(`@${seg.data.qq}`)
    }
    return acc
  }, []).join(' ').trim()
  return message
})
