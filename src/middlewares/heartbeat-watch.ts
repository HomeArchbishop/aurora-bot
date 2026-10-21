import { notifyBark } from '@/services/bark'
import { createMiddleware } from 'aurorax'

const HEARTBEAT_MISS_FACTOR = 2.5
const DEFAULT_INTERVAL_MS = 5000

let watchdogTimer: ReturnType<typeof setTimeout> | undefined
/** meta 心跳包本身超时未到达 */
let heartbeatTimedOut = false
/** heartbeat.status.online === false */
let qqOffline = false

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
  // 已处于 meta 超时态时不再挂表，避免重复提醒
  if (heartbeatTimedOut) return

  clearWatchdog()
  const timeoutMs = Math.max(intervalMs, 1000) * HEARTBEAT_MISS_FACTOR
  watchdogTimer = setTimeout(() => {
    if (heartbeatTimedOut) return
    heartbeatTimedOut = true
    clearWatchdog()
    notifySafe(notifyBark({
      title: 'aurora-bot',
      body: `OneBot 与 QQ：meta 心跳超时（>${Math.round(timeoutMs / 1000)}s 未收到）`,
    }))
  }, timeoutMs)
}

const isOnline = (status: Record<string, unknown>) => status.online === true

export const heartbeatWatch = createMiddleware('heartbeatWatch', async (ctx, next) => {
  const event = ctx.event
  if (event.post_type === 'meta_event' && event.meta_event_type === 'heartbeat') {
    const intervalMs = typeof event.interval === 'number' && event.interval > 0
      ? event.interval
      : DEFAULT_INTERVAL_MS

    if (heartbeatTimedOut) {
      heartbeatTimedOut = false
      notifySafe(notifyBark({
        title: 'aurora-bot',
        body: 'OneBot 与 QQ：meta 心跳已恢复',
      }))
    }

    if (!isOnline(event.status)) {
      if (!qqOffline) {
        qqOffline = true
        notifySafe(notifyBark({
          title: 'aurora-bot',
          body: 'OneBot 与 QQ：账号 offline（heartbeat.status.online=false）',
        }))
      }
    } else if (qqOffline) {
      qqOffline = false
      notifySafe(notifyBark({
        title: 'aurora-bot',
        body: 'OneBot 与 QQ：账号已 online',
      }))
    }

    armWatchdog(intervalMs)
  }

  await next()
})
