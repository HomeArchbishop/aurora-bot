import { JSDOM } from 'jsdom'

type DateString = `${number}-${number}-${number}`

const deduplicateList = (list: ListItem[]) => {
  return list.filter((item, index, self) =>
    index === self.findIndex(t => t.id === item.id),
  )
}

interface ListItem {
  id: string
  title: string
  date: DateString
  url: string
}

abstract class ListService {
  abstract getList (): Promise<ListItem[]>
}

export class KcnaListService implements ListService {
  async getList () {
    const response = await fetch('http://www.kcna.kp/cn')
    const html = await response.text()
    const dom = new JSDOM(html)
    const document = dom.window.document
    const list = [...document.querySelectorAll('.pointer1, .pointer2')]
    const deduplicatedList = deduplicateList(list.map(item => {
      const url = `http://www.kcna.kp${item.querySelector('a')?.getAttribute('href') ?? '/'}`
      const title = item.querySelector('a')?.textContent.trim() ?? ''
      const id = url.split('/').pop() ?? ''
      const date = (item.querySelector('.datemark')
        ?.textContent.trim().slice(1, -1).split('.').slice(0, 3).join('-') ?? '') as DateString
      return {
        id,
        title,
        date,
        url,
      }
    }))
    return deduplicatedList
  }
}
