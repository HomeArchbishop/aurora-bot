/**
 * history command
 */

import { createCommand } from '@/extensions/chat'
import { useTempDir } from '@/tempdir'
import fs from 'fs'
import path from 'path'

export const clearHistoryCommand = createCommand({
  pattern: [/^#clearhistory/, /^#clrhistory/],
  permission: 'master',
  async callback ({ send, domain: { db, dbKey, text } }) {
    await db.del(dbKey.history)
    send(text('已清除历史记录'))
  },
})

export const historyCommand = createCommand({
  pattern: [/^#history/],
  permission: 'master',
  async callback ({ send, domain: { db, dbKey, text } }) {
    const formerHistory = db.getSync(dbKey.history) ?? '[无聊天记录]'
    if (formerHistory.trim() === '') {
      send(text('[无聊天记录]'))
      return
    }
    send(text(formerHistory.split(/\n/).slice(-50).join('\n')))
  },
})

export const delHistoryCommand = createCommand({
  pattern: [/^#delhistory/],
  permission: 'master',
  async callback ({ send, domain: { db, dbKey, text } }, args) {
    const formerHistory = db.getSync(dbKey.history)
    if (formerHistory === undefined) {
      send(text('没有聊天记录可供删除'))
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
    send(text(`已删去包含/${regexStr}/的历史记录 ${deletedCount} 条`))
  },
})

export const cntHistoryCommand = createCommand({
  pattern: [/^#cnthistory/],
  permission: 'everyone',
  async callback ({ send, domain: { db, dbKey, text } }, args) {
    const formerHistory = db.getSync(dbKey.history)
    if (args.length === 0) {
      const cnt = formerHistory?.split('\n').filter(line => line.trim().length !== 0).length ?? 0
      send(text(`当前聊天记录条数: ${cnt}`))
      return
    }
    if (formerHistory === undefined) {
      send(text('没有聊天记录可供统计'))
      return
    }
    const regexStr = args.map(kw => `(${kw})`).join('|')
    const regex = new RegExp(regexStr)
    const cnt = formerHistory.split('\n')
      .filter(line => regex.test(line.replace(/^\(.*?\):\s*/g, '').trim()))
      .length
    send(text(`查询到包含/${regexStr}/的历史记录 ${cnt} 条`))
  },
})

export const dumpHistoryCommand = createCommand({
  pattern: [/^#dumphistory/],
  permission: 'master',
  async callback ({ send, domain: { db, dbKey, text, eventId, isGroup } }) {
    const formerHistory = db.getSync(dbKey.history)
    if (formerHistory === undefined || formerHistory.trim() === '') {
      send(text('没有聊天记录可供导出'))
      return
    }
    try {
      const tempdir = useTempDir()
      const filename = `history_${Date.now()}.txt`
      const filePath = path.resolve(tempdir, filename)
      fs.writeFileSync(filePath, formerHistory, 'utf-8')
      send({
        action: isGroup ? 'send_group_msg' : 'send_private_msg',
        params: {
          user_id: eventId,
          group_id: eventId,
          message: [
            {
              type: 'file',
              data: {
                file: filePath,
                name: filename,
              },
            },
          ],
        },
      })
    } catch (err: any) {
      send(text(`导出历史记录失败: ${err.message}`))
    }
  },
})
