import { createJob } from '../app'
import { sendVNRelease } from '../services/vndb/sendVNDB'

export const vnEvent = createJob('0 21 7 * * *', async (ctx) => {
  const date = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]
  await sendVNRelease({ date, isGroup: false, eventId: Number(process.env.MASTER_ID) }, ctx)
  await sendVNRelease({ date, isGroup: true, eventId: Number(process.env.MISC_GROUP_ID_KINDERGARTEN) }, ctx)

  const date2 = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000 + 24 * 3600 * 1000).toISOString().split('T')[0]
  await sendVNRelease({ date: date2, isGroup: false, eventId: Number(process.env.MASTER_ID) }, ctx)

  const date3 = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000 + 24 * 3600 * 1000 * 2).toISOString().split('T')[0]
  await sendVNRelease({ date: date3, isGroup: false, eventId: Number(process.env.MASTER_ID) }, ctx)
})
