import { createJob } from 'aurorax'
import type { CvsDetail } from '../services/bingyan-cvs/interface'
import { Cvs } from '../services/bingyan-cvs/cvs'

const formerRef: Record<'current', CvsDetail[] | null> = {
  current: null,
}

export const bingyanCvs = createJob('bingyanCvs', '10 * * * *', async (ctx) => {
  const cvs = Cvs.getInstance()
  cvs.setAuthInfo(process.env.SERVICE_BINGYAN_CVS_USERNAME, process.env.SERVICE_BINGYAN_CVS_PASSWORD)

  console.log(process.env.SERVICE_BINGYAN_CVS_PERIOD)
  const detail = await cvs.getDetail(process.env.SERVICE_BINGYAN_CVS_PERIOD)

  if (!formerRef.current) {
    formerRef.current = detail
    return
  }

  const increaseLines = []

  for (const item of detail) {
    const formerItem = formerRef.current.find(formerItem => formerItem.group_id === item.group_id)
    if (formerItem === undefined) { return }
    if (formerItem.signup_count !== item.signup_count) {
      increaseLines.push(`${item.group_name}: 新增 ${item.signup_count - formerItem.signup_count} 人`)
    }
  }

  if (increaseLines.length === 0) {
    return
  }

  const messageLines = [
    '监测到报名人数变化',
    ...increaseLines,
  ]

  ctx.send({
    action: 'send_private_msg',
    params: {
      user_id: Number(process.env.MASTER_ID),
      message: messageLines.join('\n'),
    },
  })

  ctx.send({
    action: 'send_group_msg',
    params: {
      group_id: Number(process.env.MISC_GROUP_ID_KINDERGARTEN),
      message: messageLines.join('\n'),
    },
  })
})
