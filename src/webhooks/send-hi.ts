import { createWebhook } from 'aurorax'

export const sendHi = createWebhook('sendHi', async (ctx) => {
  ctx.send({
    action: 'send_private_msg',
    params: {
      user_id: Number(process.env.MASTER_ID),
      message: 'hi',
    },
  })
})
