import { createJob } from 'aurorax'

export const sendZcMsg = createJob('sendZcMsg', '0 0 9 * * *', async (ctx) => {
  ctx.send({
    action: 'send_group_msg',
    params: {
      group_id: Number(process.env.MISC_GROUP_ID_NEW528),
      message: [
        {
          type: 'image',
          data: {
            file: 'https://multimedia.nt.qq.com.cn/download?appid=1406&fileid=EhTBmsDwfhezdHaNvAGY1zT3Rrv5ohiz0E0g_goo9PKxipu4lAMyBHByb2RQgLsvWhBY07KP_j7yrVPTE31HJOj3egJRFYIBAmd6&rkey=CAMSMG41RvIWht1tyqLd0Si8zDkZvLlH1SsWn4sbykOUL-AWrielML7fRqMyhjsScx66dw',
          },
        },
      ],
    },
  })
})
