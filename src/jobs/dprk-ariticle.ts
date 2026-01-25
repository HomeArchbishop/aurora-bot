import { useDatabase } from '@/db'
import { KcnaArticleService } from '@/services/dprk/article'
import { getTodayArticleList } from '@/services/dprk/usual'
import { createMessageSend } from '@/utils/onebot-utils'
import { createJob, type NodeSegment } from 'aurorax'

const db = useDatabase()

const getTodayDate = () => {
  const year = new Date().getFullYear()
  const month = new Date().getMonth() + 1
  const monthStr = month.toString().padStart(2, '0')
  const day = new Date().getDate()
  const dayStr = day.toString().padStart(2, '0')
  return `${year}-${monthStr}-${dayStr}`
}

const isValidJSON = (json: string) => {
  try {
    JSON.parse(json)
    return true
  } catch (error) {
    return false
  }
}

const rplSymbol = (str: string) => {
  return str.replace(/《/g, '〈').replace(/》/g, '〉')
}

export const dprkAriticle = createJob('dprkAriticle', '0 * * * *', async (ctx) => {
  const lastNotifiedDate = db.getSync('dprkAriticle:last_notified_date') as string | undefined
  const today = getTodayDate()
  if (lastNotifiedDate !== today) {
    db.put('dprkAriticle:last_notified_date', today)
    db.put('dprkAriticle:today_notified_article_list', '[]')
  }

  const todayNotifiedArticleList = [] as string[]
  const todayNotifiedArticleListRaw = db.getSync('dprkAriticle:today_notified_article_list')
  if (todayNotifiedArticleListRaw === undefined || !isValidJSON(todayNotifiedArticleListRaw)) {
    db.put('dprkAriticle:today_notified_article_list', '[]')
  } else {
    todayNotifiedArticleList.push(...JSON.parse(todayNotifiedArticleListRaw))
  }

  const articleList = await getTodayArticleList()
  const newArticleList = articleList.filter(item => !todayNotifiedArticleList.includes(item.id)).slice(0, 2)

  if (!newArticleList.length) {
    return
  }

  const articles = await Promise.all(newArticleList.map(item => new KcnaArticleService().getArticle(item.url)))

  const nextTodayNotifiedArticleList = [...todayNotifiedArticleList, ...newArticleList.map(item => item.id)]
  db.put('dprkAriticle:today_notified_article_list', JSON.stringify(nextTodayNotifiedArticleList))

  const message = createMessageSend([
    { type: 'text', data: { text: `[DPRK news] 更新了${newArticleList.length}条新闻\n\n` } },
    ...newArticleList.map(item => ({ type: 'text', data: { text: `《${rplSymbol(item.title)}》 ${item.url}\n\n` } } as const)),
  ])

  const forwardMessage = articles.map(item => {
    const kimCnt = [
      ['一', item.content.match(/金日成/g)?.length ?? 0],
      ['二', item.content.match(/金正日/g)?.length ?? 0],
      ['三', item.content.match(/金正恩/g)?.length ?? 0],
    ] as const
    let kimCntStr = ''
    if (kimCnt.every(([, cnt]) => cnt === 0)) {
      kimCntStr = '（金量：0）'
    } else {
      const str = kimCnt.filter(([, cnt]) => cnt > 0).map(([who, cnt]) => `${who}金${cnt}次`).join('、')
      kimCntStr = `（金量：${str}）`
    }
    return {
      type: 'node',
      data: {
        nickname: 'kcna-news',
        content: [
          {
            type: 'text',
            data: {
              text: `${kimCntStr}\n\n《${rplSymbol(item.title)}》\n\n${item.content}`,
            },
          },
        ],
      },
    } as NodeSegment
  })

  ;[
    Number(process.env.MISC_GROUP_ID_NEW528),
  ].forEach(groupId => {
    ctx.send({
      action: 'send_group_msg',
      params: {
        group_id: groupId,
        message,
      },
    })
    ctx.send({
      action: 'send_group_forward_msg',
      params: {
        group_id: groupId,
        messages: forwardMessage,
      },
    })
  })
})
