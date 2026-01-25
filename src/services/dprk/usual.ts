import { KcnaListService } from './list'

const getTodayDate = () => {
  const year = new Date().getFullYear()
  const month = new Date().getMonth() + 1
  const monthStr = month.toString().padStart(2, '0')
  const day = new Date().getDate()
  const dayStr = day.toString().padStart(2, '0')
  return `${year}-${monthStr}-${dayStr}`
}

export const getTodayArticleList = async () => {
  const list = await new KcnaListService().getList()
  const today = getTodayDate()
  const todayArticle = list.filter(item => item.date === today)
  return todayArticle
}

if (import.meta.main) {
  await getTodayArticleList()
}
