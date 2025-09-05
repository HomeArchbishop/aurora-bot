import fs from 'fs'
import { createMiddleware } from '../app'
import path from 'path'
import { execSync } from 'child_process'

export const accelerateGif = createMiddleware(async (ctx, next) => {
  const event = ctx.event
  if (event.post_type !== 'message') { await next(); return }
  const imageSeg = event.message.find(seg => seg.type === 'image')
  if (
    imageSeg?.data.sub_type === 1 &&
    event.user_id === Number(process.env.MASTER_ID)
  ) {
    const file = imageSeg.data.url
    if (file === undefined) {
      await next()
      return
    }
    const resp = await fetch(file)
    const ab = await resp.arrayBuffer()
    const filename = imageSeg.data.file
    const filePath = path.resolve(ctx.tempdir, filename)
    const newFilePath = path.resolve(ctx.tempdir, filename + '-accelerate.gif')
    fs.writeFileSync(filePath, Buffer.from(ab))
    execSync(`ffmpeg -i ${filePath} -vf "palettegen" palette.png`)
    execSync(`ffmpeg -i ${filePath} -i palette.png -filter_complex "[0:v]setpts=0.1*PTS,fps=60,paletteuse" -c:v gif -loop 0 ${newFilePath}`)
    const newBuffer = fs.readFileSync(newFilePath)
    ctx.send({
      action: 'send_private_msg',
      params: {
        user_id: Number(process.env.MASTER_ID),
        message: [
          {
            type: 'image',
            data: {
              file: `base64://${Buffer.from(newBuffer).toString('base64')}`,
            },
          },
        ],
      },
    })
    return
  }
  await next()
})
