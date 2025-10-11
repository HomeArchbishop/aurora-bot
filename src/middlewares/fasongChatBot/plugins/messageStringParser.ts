import { createMessageStringParser } from '@/extends/chat'
import { decryptText } from '@/services/hatimi'

export const messageStringParser = createMessageStringParser(async ({ event, domain }) => {
  const pureText = event.message.reduce<string[]>((acc, seg) => {
    if (seg.type === 'text') {
      acc.push(seg.data.text)
    }
    return acc
  }, []).join(' ').trim()
  try {
    if (pureText.startsWith('哈基米') && pureText.length > 3) {
      const hajimiText = pureText.split('').filter(char => char === '哈' || char === '基' || char === '米').join('')
      const text = hajimiText.slice(3)
      domain.flags.isHajiami = true
      return decryptText(text)
    }
  } catch (error) {
    domain.flags.isHajiami = false
    console.error(error)
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
