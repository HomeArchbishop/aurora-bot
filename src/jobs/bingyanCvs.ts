import { createJob } from '../app'
import type { CvsDetail } from '../services/bingyan-cvs/interface'
import { Cvs } from '../services/bingyan-cvs/cvs'

const formerRef: Record<'current', CvsDetail[] | null> = {
  current: null,
}

export const bingyanCvs = createJob('*/5 * * * * *', async (ctx) => {
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
    item.signup_count += 1
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
})
