import { createWebhook } from '../app'

export const ledger = createWebhook('ledger', async (ctx) => {
  const amountStr: string = JSON.parse(
    Buffer.from(ctx.triggerCtx.body).toString('utf-8')).amount
  if (amountStr === null) {
    ctx.send({
      action: 'send_private_msg',
      params: {
        user_id: Number(process.env.MASTER_ID),
        message: '缺少 amount 参数'
      }
    })
    return
  }
  const amount = -Number(parseFloat(amountStr).toFixed(2))
  if (isNaN(amount)) {
    ctx.send({
      action: 'send_private_msg',
      params: {
        user_id: Number(process.env.MASTER_ID),
        message: 'amount 参数必须是一个数字'
      }
    })
    return
  }
  ctx.send({
    action: 'send_private_msg',
    params: {
      user_id: Number(process.env.MASTER_ID),
      message: `已记录金额: ${amount.toFixed(2)} 元`
    }
  })
})
