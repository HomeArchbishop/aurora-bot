import type { App, ConnectedEvent, ConnectionLostEvent, DisconnectedEvent } from 'aurorax'
import { notifyBark } from '@/services/bark'

const notifySafe = (task: Promise<void>) => {
  task.catch((error) => {
    console.error('[lifecycle-notify]', error instanceof Error ? error.message : String(error))
  })
}

export const registerConnectionLifecycle = (app: App) => {
  app.on('connected', (event: ConnectedEvent) => {
    if (!event.reconnected) return
    notifySafe(notifyBark({
      title: 'aurora-bot',
      body: 'aurorax 与 OneBot WS 已重连',
    }))
  })

  app.on('disconnected', (event: DisconnectedEvent) => {
    if (event.manual) return
    notifySafe(notifyBark({
      title: 'aurora-bot',
      body: 'aurorax 与 OneBot WS 已断开',
    }))
  })

  app.on('connection-lost', (event: ConnectionLostEvent) => {
    notifySafe(notifyBark({
      title: 'aurora-bot',
      body: `aurorax 与 OneBot WS 重连失败（已尝试 ${event.attempts} 次）`,
    }))
  })
}
