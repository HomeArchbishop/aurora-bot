import { createMessageStringParser } from '@/extends/chat'
import { decryptText } from '@/services/hatimi'

export const messageStringParser = createMessageStringParser(async ({ event, domain }) => {
  if (event.message.find(seg => seg.type === 'text' && seg.data.text.trim().startsWith('哈基米')) !== undefined) {
    const text = event.message.reduce<string[]>((acc, seg) => {
      if (seg.type === 'text') {
        acc.push(seg.data.text)
      }
      return acc
    }, []).join(' ').trim().slice(3)
    domain.flags.isHajiami = true
    return decryptText(text)
  }
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
