import type { Job } from '../app'

export const everyMinSend198MsgFactory = (): [string, Job] => {
  return [
    '* * * * *',
    async (ctx) => {
      ctx.send({
        action: 'send_private_msg',
        params: {
          user_id: Number(process.env.MASTER_ID),
          message: '每分钟发送一次消息'
        }
      })
    }
  ]
}
