import { createJob } from '../app'

export const everyMinSend198Msg = createJob('* * * * *', async (ctx) => {
  ctx.send({
    action: 'send_private_msg',
    params: {
      user_id: Number(process.env.MASTER_ID),
      message: '每分钟发送一次消息',
    },
  })
})
