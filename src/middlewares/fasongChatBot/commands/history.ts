/**
 * history command
 */

import { createCommand } from '../../../chat'

export const clearHistoryCommand = createCommand(['#clearhistory', '#clrhistory'],
  async ({ send, db, dbKey, textSegmentRequest }) => {
    await db.del(dbKey.history)
    send(textSegmentRequest('已清除历史记录'))
  },
  { permission: 'master' }
)

export const historyCommand = createCommand('#history',
  async ({ send, db, dbKey, textSegmentRequest }) => {
    const formerHistory = db.getSync(dbKey.history) ?? '[无聊天记录]'
    if (formerHistory.trim() === '') {
      send(textSegmentRequest('[无聊天记录]'))
      return
    }
    send(textSegmentRequest(formerHistory.split(/\n/).slice(-50).join('\n')))
  },
  { permission: 'master' }
)

export const delHistoryCommand = createCommand('#delhistory',
  async ({ send, db, dbKey, textSegmentRequest }, args) => {
    const formerHistory = db.getSync(dbKey.history)
    if (formerHistory === undefined) {
      send(textSegmentRequest('没有聊天记录可供删除'))
      return
    }
    const regexStr = args.map(kw => `(${kw})`).join('|')
    const regex = new RegExp(regexStr)
    const newHistory = formerHistory.split('\n')
      .filter(line => !regex.test(line.replace(/^\(.*?\):\s*/g, '').trim()))
      .join('\n')
    await db.put(dbKey.history, newHistory)
    const deletedCount =
    formerHistory.split('\n').filter(line => line.trim().length !== 0).length -
    newHistory.split('\n').filter(line => line.trim().length !== 0).length
    send(textSegmentRequest(`已删去包含/${regexStr}/的历史记录 ${deletedCount} 条`))
  },
  { permission: 'master' }
)

export const cntHistoryCommand = createCommand('#cnthistory',
  async ({ send, db, dbKey, textSegmentRequest }, args) => {
    const formerHistory = db.getSync(dbKey.history)
    if (args.length === 0) {
      const cnt = formerHistory?.split('\n').filter(line => line.trim().length !== 0).length ?? 0
      send(textSegmentRequest(`当前聊天记录条数: ${cnt}`))
      return
    }
    if (formerHistory === undefined) {
      send(textSegmentRequest('没有聊天记录可供统计'))
      return
    }
    const regexStr = args.map(kw => `(${kw})`).join('|')
    const regex = new RegExp(regexStr)
    const cnt = formerHistory.split('\n')
      .filter(line => regex.test(line.replace(/^\(.*?\):\s*/g, '').trim()))
      .length
    send(textSegmentRequest(`查询到包含/${regexStr}/的历史记录 ${cnt} 条`))
  },
  { permission: 'everyone' }
)
