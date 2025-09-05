/**
 * equipment commands
 */

import { createCommand } from '../../../chat'

export const equipCommand = createCommand(['#equip', '#eq'],
  async ({ send, db, dbKey, textSegmentRequest }, args) => {
    const equipment = args.map(arg => arg.split(',')).flat()
    const formerEquipment = db.getSync(dbKey.equipment)?.split(',') ?? []
    const set = new Set(formerEquipment)
    equipment.forEach(e => set.add(e))
    await db.put(dbKey.equipment, Array.from(set).join(','))
    send(textSegmentRequest(`已装备: ${Array.from(set).join(',')}`))
  },
  { permission: 'everyone' },
)

export const unequipCommand = createCommand(['#unequip', '#uneq'],
  async ({ send, db, dbKey, textSegmentRequest }, args) => {
    const equipment = args.map(arg => arg.split(',')).flat()
    const formerEquipment = db.getSync(dbKey.equipment)?.split(',') ?? []
    const set = new Set(formerEquipment)
    equipment.forEach(e => set.delete(e))
    await db.put(dbKey.equipment, Array.from(set).join(','))
    send(textSegmentRequest(`卸下装备: ${equipment.join(',')}`))
  },
  { permission: 'everyone' },
)

export const clearEquipmentCommand = createCommand(['#cleareq', '#clreq'],
  async ({ send, db, dbKey, textSegmentRequest }) => {
    await db.del(dbKey.equipment)
    send(textSegmentRequest('已清除装备列表'))
  },
  { permission: 'everyone' },
)

export const countEquipmentCommand = createCommand('#cnteq',
  async ({ send, db, dbKey, textSegmentRequest }) => {
    const cnt = (db.getSync(dbKey.equipment)?.split(',') ?? []).length
    send(textSegmentRequest(`当前装备数量: ${cnt}`))
  },
  { permission: 'everyone' },
)

export const listEquipmentCommand = createCommand('#lseq',
  async ({ send, db, dbKey, textSegmentRequest }) => {
    const equipment = db.getSync(dbKey.equipment)
    if (equipment === undefined || equipment.trim() === '') {
      send(textSegmentRequest('当前没有装备'))
      return
    }
    send(textSegmentRequest(`当前装备列表: ${equipment}`))
  },
  { permission: 'master' },
)
