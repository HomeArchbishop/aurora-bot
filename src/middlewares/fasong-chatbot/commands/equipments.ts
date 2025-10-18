/**
 * equipment commands
 */

import { createCommand } from '@/extensions/chat'

export const equipCommand = createCommand({
  pattern: [/^#equip/, /^#eq/],
  permission: 'everyone',
  async callback ({ send, domain: { db, dbKey, text } }, args) {
    const equipment = args.map(arg => arg.split(',')).flat()
    const formerEquipment = db.getSync(dbKey.equipment)?.split(',') ?? []
    const set = new Set(formerEquipment)
    equipment.forEach(e => set.add(e))
    await db.put(dbKey.equipment, Array.from(set).join(','))
    send(text(`已装备: ${Array.from(set).join(',')}`))
  },
})

export const unequipCommand = createCommand({
  pattern: [/^#unequip/, /^#uneq/],
  permission: 'everyone',
  async callback ({ send, domain: { db, dbKey, text } }, args) {
    const equipment = args.map(arg => arg.split(',')).flat()
    const formerEquipment = db.getSync(dbKey.equipment)?.split(',') ?? []
    const set = new Set(formerEquipment)
    equipment.forEach(e => set.delete(e))
    await db.put(dbKey.equipment, Array.from(set).join(','))
    send(text(`卸下装备: ${equipment.join(',')}`))
  },
})

export const clearEquipmentCommand = createCommand({
  pattern: [/^#cleareq/, /^#clreq/],
  permission: 'everyone',
  async callback ({ send, domain: { db, dbKey, text } }, args) {
    await db.del(dbKey.equipment)
    send(text('已清除装备列表'))
  },
})

export const countEquipmentCommand = createCommand({
  pattern: [/^#cnteq/],
  permission: 'everyone',
  async callback ({ send, domain: { db, dbKey, text } }, args) {
    const cnt = (db.getSync(dbKey.equipment)?.split(',') ?? []).length
    send(text(`当前装备数量: ${cnt}`))
  },
})

export const listEquipmentCommand = createCommand({
  pattern: [/^#lseq/],
  permission: 'master',
  async callback ({ send, domain: { db, dbKey, text } }, args) {
    const equipment = db.getSync(dbKey.equipment)
    if (equipment === undefined || equipment.trim() === '') {
      send(text('当前没有装备'))
      return
    }
    send(text(`当前装备列表: ${equipment}`))
  },
})
