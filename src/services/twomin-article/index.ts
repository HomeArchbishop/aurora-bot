import { LLM } from '@/extensions/llm'
import { splitAndTrimAndFilterEmpty } from '@/utils/string'
import { env } from 'bun'

export type TwoMinArticleManifestItem = {
  slug: string
  title: string
  file: string
}

const MANIFEST_URL = 'https://2min.buuug.top/articles/manifest.json'
const ARTICLE_URL_PREFIX = 'https://2min.buuug.top/a/'
const ARTICLE_CONTENT_PREFIX = 'https://2min.buuug.top/articles/'
const GUIDE_FALLBACK = '晨读导读：两分钟速览，先看观点再看细节；带着一个问题读，会更有收获。'

const llm = new LLM({
  platform: env.LLM_PLATFORM,
  apiHost: env.LLM_API_HOST,
  keys: splitAndTrimAndFilterEmpty(env.LLM_API_KEYS, ','),
  model: env.CHATBOT_FASONG_LLM_MODEL,
  temperature: 0.9,
  topP: 0.85,
})

const isManifestItem = (item: unknown): item is TwoMinArticleManifestItem => {
  return Boolean(item) &&
    typeof item === 'object' &&
    typeof (item as { slug?: unknown }).slug === 'string' &&
    typeof (item as { title?: unknown }).title === 'string' &&
    typeof (item as { file?: unknown }).file === 'string'
}

export const fetchManifest = async () => {
  const response = await fetch(MANIFEST_URL)
  if (!response.ok) {
    throw new Error(`failed to fetch manifest: ${response.status}`)
  }
  const json = await response.json()
  if (!Array.isArray(json)) {
    throw new Error('manifest is not an array')
  }
  return json.filter(isManifestItem)
}

export const fetchArticleContent = async (file: string) => {
  const response = await fetch(`${ARTICLE_CONTENT_PREFIX}${encodeURIComponent(file)}`)
  if (!response.ok) {
    throw new Error(`failed to fetch article content: ${response.status}`)
  }
  return await response.text()
}

const createMorningGuide = async (title: string, content: string) => {
  const userPrompt = [
    '你是晨读导读编辑。',
    '请写 1-2 句话中文导读，语气自然、简短明确。',
    '目标是帮助群友进入文章重点。',
    '从叙事的角度出发，讲述文章中吸引眼球的叙事，尽可能使用明确的露骨的词汇。',
    '以这篇文章/这段文字/这个故事/这篇故事等作为开头。',
    '尽管需要露骨的词汇，但如遇可能敏感表达，请用谐音或近音替代，不要出现原来的露骨词。',
    '禁止 markdown，禁止分点，输出纯文本。',
    `文章标题：${title}`,
    '以下是正文（可能被截断）：',
    content.slice(0, 3000),
  ].join('\n')
  const reply = await llm.completions([
    {
      role: 'user',
      content: [{ type: 'text', text: userPrompt }],
    },
  ])
  return reply.replace(/\n+/g, ' ').trim()
}

export const buildMorningReadMessage = async (item: TwoMinArticleManifestItem) => {
  const articleUrl = `${ARTICLE_URL_PREFIX}${item.slug}`
  const articleContent = await fetchArticleContent(item.file)
  let guideText = GUIDE_FALLBACK
  try {
    guideText = await createMorningGuide(item.title, articleContent)
  } catch (_error) {}
  return `[晨读推荐]《${item.title}》\n${guideText}\n${articleUrl}`
}
