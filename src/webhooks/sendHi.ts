import { createWebhook } from '../app'

export const sendHi = createWebhook('sendhi', async (ctx) => {
  ctx.send({
    action: 'send_private_msg',
    params: {
      user_id: Number(process.env.MASTER_ID),
      message: 'hi',
    },
  })
})
