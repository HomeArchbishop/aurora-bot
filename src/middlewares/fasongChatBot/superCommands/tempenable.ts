/**
 * tempenable super command
 */

import { createCommand } from '../../../chat'

export const tempEnableCommand = createCommand(['#tempenable'],
  async function ({ event, send, textSegmentRequest }, args) {
    if (args.length < 1) {
      send(textSegmentRequest('用法: #tempenable <rate>'))
      return
    }
    const [rate] = args
    const rateNum = parseFloat(rate)
    if (event.post_type === 'message') {
      if (event.message_type === 'group') {
        const groupId = event.group_id
        this.enableGroup(groupId, { rate: rateNum, replyOnAt: true })
        send(textSegmentRequest(`已临时启用 group[${groupId}]，速率[${rateNum}]`))
      } else {
        const userId = event.user_id
        this.enablePrivate(userId, { rate: rateNum })
        send(textSegmentRequest(`已临时启用 private[${userId}]，速率[${rateNum}]`))
      }
    }
  },
  { permission: 'master' },
)
