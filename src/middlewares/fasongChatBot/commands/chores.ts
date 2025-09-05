/**
 * chores commands
 */

import { createCommand } from '../../../chat'

export const shutupCommand = createCommand(['#shutup', '#ballgag'],
  async ({ send, db, dbKey, textSegmentRequest }, args) => {
    const arg = args[0] ?? 'true'
    if (arg === 'false' || arg === '0' || arg === 'off' || arg === '脱ぐ') {
      await db.del(dbKey.isShutup)
      send(textSegmentRequest('已取消禁言'))
    } else if (arg === 'true' || arg === '1' || arg === 'on' || arg === '着る') {
      await db.put(dbKey.isShutup, 'true')
      send(textSegmentRequest('已禁言'))
    }
  },
  { permission: 'everyone' },
)

export const refreshKeyCommand = createCommand(['#refreshkey', '#key'],
  async ({ send, textSegmentRequest, llm }, args) => {
    if (llm === undefined) {
      send(textSegmentRequest('LLM未初始化，请稍后再试'))
      return
    }
    await llm.refreshKeyStatus()
    const keyStatus = llm.getKeyStatus()
    send(textSegmentRequest(
      '已检查 keys 状态\n' +
      keyStatus.map((status, i) =>
        `#${i.toString().padEnd(4, ' ')}\t${status === 'ok' ? '✅' : status === 'bad' ? '❌' : '❓'}`,
      ).join('\n'),
    ))
  },
  { permission: 'master' },
)
