import { JSDOM } from 'jsdom'

interface Article {
  title: string
  content: string
}

abstract class ArticleService {
  abstract getArticle (id: string): Promise<Article>
}

export class KcnaArticleService implements ArticleService {
  async getArticle (url: string) {
    const response = await fetch(url)
    const html = await response.text()
    const dom = new JSDOM(html)
    const document = dom.window.document
    const title = document.querySelector('.article-content-title')?.textContent.trim() ?? ''
    const content = [...document.querySelectorAll('.content-wrapper p')].map(item => item.textContent.trim()).join('\n') ?? ''
    return {
      title,
      content,
    }
  }
}
