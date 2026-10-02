import { createMiddleware, type App } from 'aurorax'

export const createAppInfoMw = (app: App) => createMiddleware('appInfo', async (ctx, next) => {
  const event = ctx.event
  if (event.post_type !== 'message' || event.message_type !== 'private') {
    return await next()
  }
  if (event.user_id !== Number(process.env.MASTER_ID) || event.raw_message !== 'info') {
    return await next()
  }

  const info = app.info()
  const text = [
    '[app.info]',
    `middlewares (${info.middlewares.length}):`,
    ...info.middlewares.map(item => `  #${item.index} ${item.name}`),
    `jobs (${info.jobs.length}):`,
    ...info.jobs.map(item => `  #${item.index} ${item.name} (${item.spec})`),
    `webhooks (${info.webhooks.length}):`,
    ...info.webhooks.map(item => `  ${item.webhookId} ${item.name}`),
  ].join('\n')

  ctx.send({
    action: 'send_private_msg',
    params: {
      user_id: event.user_id,
      message: text,
    },
  })
})
