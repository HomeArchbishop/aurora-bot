import { createMiddleware } from 'aurorax'

export const emotion2image = createMiddleware(async (ctx, next) => {
  const event = ctx.event
  if (event.post_type === 'message' &&
    event.user_id === Number(process.env.MASTER_ID) &&
    event.message.find(seg => seg.type === 'image') !== undefined &&
    event.message.find(seg => seg.type === 'image')?.data.sub_type !== 0) {
    const imageSeg = event.message.filter(seg => seg.type === 'image').filter(seg => seg.data.sub_type !== 0 && seg.data.url !== undefined)
    const imageUrls = imageSeg.map(seg => seg.data.url).filter(url => url !== undefined)
    // const pending = await Promise.allSettled(imageUrls.map(async url => await fetch(url).then(async r => {
    //   const ab = await r.arrayBuffer()
    //   const uint8Array = new Uint8Array(ab)
    //   for (let i = 0; i < uint8Array.length; i++) {
    //     if (Math.random() < 0.01) {
    //       uint8Array[i] ^= 1
    //     }
    //   }
    //   return Buffer.from(uint8Array.buffer).toString('base64')
    // })))
    ctx.send({
      action: 'send_private_msg',
      params: {
        user_id: Number(process.env.MASTER_ID),
        message: imageUrls.map(url => ({ type: 'text', data: { text: url } })),
        // message: imageSeg.map((seg, i) => {
        //   const settleResult = pending[i]
        //   if (settleResult.status === 'rejected') {
        //     return {
        //       type: 'text',
        //       data: {
        //         text: `emotion2image error: ${settleResult.reason}`
        //       }
        //     }
        //   }
        //   return {
        //     type: 'image',
        //     data: {
        //       file: `base64://${settleResult.value}`
        //     }
        //   }
        // })
      },
    })
    return
  }
  await next()
})
