import { useDatabase } from '@/db'
import { createMessageSend } from '@/utils/onebot-utils'
import { createJob } from 'aurorax'

const db = useDatabase()

let lastNotifyCycle: number | null = null

export const taffyLive = createJob('taffyLive', '*/5 * * * * *', async (ctx) => {
  const currentNotifyCycle = ~~((new Date().getHours() + 6) / 24) // 0 or 1
  const lastNotifiedTime = db.getSync('taffyLive:last_notified_time')

  // 如果当前周期与上次通知过的周期相同, 且数据库有记录，则 skip
  if (lastNotifyCycle !== null && currentNotifyCycle === lastNotifyCycle && lastNotifiedTime) { return }

  const response = await fetch('https://api.live.bilibili.com/room/v1/Room/get_info?room_id=22603245')
  const data = await response.json()
  const isLive = data.data.live_status === 1

  if (!isLive) { return }

  const notifyTime = data.data.live_time

  lastNotifyCycle = currentNotifyCycle
  db.put('taffyLive:last_notified_time', notifyTime)

  if (lastNotifiedTime === notifyTime) { return }

  const message = createMessageSend([
    { type: 'text', data: { text: '[Ace Taffy] 正在直播\n' } },
    { type: 'text', data: { text: 'https://live.bilibili.com/22603245' } },
    { type: 'image', data: { file: data.data.user_cover } },
  ])
  ;[
    Number(process.env.MISC_GROUP_ID_KINDERGARTEN),
    Number(process.env.MISC_GROUP_ID_NEW528),
  ].forEach(groupId => {
    ctx.send({
      action: 'send_group_msg',
      params: {
        group_id: groupId,
        message: [
          ...message,
          { type: 'at', data: { qq: process.env.MASTER_ID } },
        ],
      },
    })
  })
  ctx.send({
    action: 'send_private_msg',
    params: {
      user_id: Number(process.env.MASTER_ID),
      message,
    },
  })
})
