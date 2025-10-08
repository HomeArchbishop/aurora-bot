/**
 * tempenable super command
 */

import { createCommand } from '@/extends/chat'

export const tempEnableCommand = createCommand({
  pattern: [/^#tempenable/],
  permission: 'master',
  async callback ({ send, event, domain: { text } }, args) {
    if (args.length < 1) {
      send(text('用法: #tempenable <rate>'))
      return
    }
    const [rate] = args
    const rateNum = parseFloat(rate)
    if (event.post_type === 'message') {
      if (event.message_type === 'group') {
        const groupId = event.group_id
        this.enableGroup(groupId, { rate: rateNum, replyOnAt: true })
        send(text(`已临时启用 group[${groupId}]，速率[${rateNum}]`))
      } else {
        const userId = event.user_id
        this.enablePrivate(userId, { rate: rateNum })
        send(text(`已临时启用 private[${userId}]，速率[${rateNum}]`))
      }
    }
  },
})
