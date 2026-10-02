import { notifyBark } from '@/services/bark'
import { createMiddleware } from 'aurorax'

const HEARTBEAT_MISS_FACTOR = 2.5
const DEFAULT_INTERVAL_MS = 5000

let watchdogTimer: ReturnType<typeof setTimeout> | undefined
let heartbeatLost = false

const notifySafe = (task: Promise<void>) => {
  task.catch((error) => {
    console.error('[heartbeat-watch]', error instanceof Error ? error.message : String(error))
  })
}

const clearWatchdog = () => {
  if (watchdogTimer === undefined) return
  clearTimeout(watchdogTimer)
  watchdogTimer = undefined
}

const armWatchdog = (intervalMs: number) => {
  // 已处于失联态时不再挂表，避免重复提醒
  if (heartbeatLost) return

  clearWatchdog()
  const timeoutMs = Math.max(intervalMs, 1000) * HEARTBEAT_MISS_FACTOR
  watchdogTimer = setTimeout(() => {
    if (heartbeatLost) return
    heartbeatLost = true
    clearWatchdog()
    notifySafe(notifyBark({
      title: 'aurora-bot',
      body: `OneBot 与 QQ 心跳超时（>${Math.round(timeoutMs / 1000)}s 未收到 meta 心跳）`,
    }))
  }, timeoutMs)
}

export const heartbeatWatch = createMiddleware('heartbeatWatch', async (ctx, next) => {
  const event = ctx.event
  if (event.post_type === 'meta_event' && event.meta_event_type === 'heartbeat') {
    const intervalMs = typeof event.interval === 'number' && event.interval > 0
      ? event.interval
      : DEFAULT_INTERVAL_MS

    if (heartbeatLost) {
      heartbeatLost = false
      notifySafe(notifyBark({
        title: 'aurora-bot',
        body: 'OneBot 与 QQ 心跳已恢复',
      }))
    }

    armWatchdog(intervalMs)
  }

  await next()
})
