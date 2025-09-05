import { createJob } from '../app'

export const tiichermate = createJob('*/3 * * * * *', async (ctx) => {
  const openid = process.env.TIICHERMATE_OPENID
  const api = process.env.TIICHERMATE_API
  if (openid === undefined || api === undefined) { return }
  try {
    const json = await fetch(`${api}/api/active_signs?openId=${openid}`).then(async r => await r.json())
    if (json.message !== undefined) { throw new Error(json.message as string) }
    if (!Array.isArray(json)) { throw new Error('返回未知数据格式') }
    if (json.length === 0) { return }
    ctx.send({
      action: 'send_private_msg',
      params: {
        user_id: Number(process.env.MASTER_ID),
        message: `[微助教] 当前有 ${json.length} 个签到\n` + json.map((item: any) =>
              `${item.name} ${item.isGPS as boolean ? 'GPS签到' : '普通签到'} ${item.courseId}/${item.signId}`,
        ).join('\n'),
      },
    })
  } catch (err: any) {
    ctx.send({
      action: 'send_private_msg',
      params: {
        user_id: Number(process.env.MASTER_ID),
        message: 'tiichermate错误' + err.message,
      },
    })
  }
})
