import { useDatabase } from '@/db'
import { buildMorningReadMessage, fetchManifest } from '@/services/twomin-article'
import { createJob } from 'aurorax'
import { env } from 'bun'

const db = useDatabase()

type PublishedGroupMap = Record<string, string[]>
const PUBLISHED_GROUPS_KEY = 'send2minArticle:published_groups_by_slug'
const TARGET_GROUP_ID = `${env.MISC_GROUP_ID_NEW528}`

const parsePublishedGroupMap = (value: string | undefined) => {
  if (value === undefined) {
    return {} as PublishedGroupMap
  }
  try {
    const parsed = JSON.parse(value)
    if (parsed && typeof parsed === 'object') {
      return Object.fromEntries(
        Object.entries(parsed as Record<string, unknown>)
          .map(([slug, groups]) => [slug, Array.isArray(groups) ? groups.filter((item): item is string => typeof item === 'string') : []]),
      )
    }
  } catch (_error) {}
  return {} as PublishedGroupMap
}

export const send2minArticle = createJob('send2minArticle', '0 0 9 * * *', async (ctx) => {
  const manifestItems = await fetchManifest()
  const publishedGroupMap = parsePublishedGroupMap(db.getSync(PUBLISHED_GROUPS_KEY) as string | undefined)
  const latestUnpublishedItem = manifestItems.find(item => !(publishedGroupMap[item.slug] ?? []).includes(TARGET_GROUP_ID))
  if (latestUnpublishedItem === undefined) {
    return
  }

  const text = await buildMorningReadMessage(latestUnpublishedItem)

  ctx.send({
    action: 'send_group_msg',
    params: {
      group_id: Number(env.MISC_GROUP_ID_NEW528),
      message: text,
    },
  })

  const groups = publishedGroupMap[latestUnpublishedItem.slug] ?? []
  const nextGroupMap = {
    ...publishedGroupMap,
    [latestUnpublishedItem.slug]: [...new Set([...groups, TARGET_GROUP_ID])],
  }
  db.put(PUBLISHED_GROUPS_KEY, JSON.stringify(nextGroupMap))
})
