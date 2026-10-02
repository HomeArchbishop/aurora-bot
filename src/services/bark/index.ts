import { env } from 'bun'

type NotifyBarkOptions = {
  title: string
  body: string
  group?: string
  ttl?: number
}

export const notifyBark = async ({
  title,
  body,
  group = 'aurora-bot',
  ttl = 600,
}: NotifyBarkOptions) => {
  const key = env.BARK_KEY
  if (!key) {
    return
  }

  const url = new URL(`https://api.day.app/${encodeURIComponent(key)}/${encodeURIComponent(title)}/${encodeURIComponent(body)}`)
  url.searchParams.set('group', group)
  url.searchParams.set('ttl', String(ttl))

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`bark notify failed: ${response.status}`)
  }
}
