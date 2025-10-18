/**
 * chores commands
 */

import { createCommand } from '@/extensions/chat'

export const shutupCommand = createCommand({
  pattern: [/^#shutup/, /^#ballgag/],
  permission: 'everyone',
  async callback ({ send, domain: { db, dbKey, text } }, args) {
    const arg = args[0] ?? 'true'
    if (arg === 'false' || arg === '0' || arg === 'off' || arg === '脱ぐ') {
      await db.del(dbKey.isShutup)
      send(text('已取消禁言'))
    } else if (arg === 'true' || arg === '1' || arg === 'on' || arg === '着る') {
      await db.put(dbKey.isShutup, 'true')
      send(text('已禁言'))
    }
  },
})

export const refreshKeyCommand = createCommand({
  pattern: [/^#refreshkey/, /^#key/],
  permission: 'master',
  async callback ({ send, domain: { llm, text } }, args) {
    if (llm === undefined) {
      send(text('LLM未初始化，请稍后再试'))
      return
    }
    const keyStatus = llm.getKeyStatuses()
    send(text(
      '已检查 keys 状态\n' +
      keyStatus.map(({ status }, i) =>
        `#${i.toString().padEnd(4, ' ')}\t${status === 'ok' ? '✅' : status === 'bad' ? '❌' : '❓'}`,
      ).join('\n'),
    ))
  },
})
