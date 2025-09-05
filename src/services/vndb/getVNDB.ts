interface ReleaseInfoByDateOptions {
  date?: string
  page?: number
}

interface ReleaseInfo {
  count: number
  more: boolean
  results: Array<{
    id: string
    title: string
    alttitle: string | null
    has_ero: boolean
    languages: Array<{ lang: string }>
    vns: Array<{
      id: string
      title: string
      alttitle: string | null
    }>
    producers: Array<{
      id: string
      name: string
      original: string | null
      aliases: string[]
      developer: boolean
    }>
  }>
}

async function getReleaseInfo ({ date, page = 1 }: ReleaseInfoByDateOptions): Promise<ReleaseInfo> {
  const filters: string[] = []
  if (date !== undefined) {
    filters.push('released', '=', date)
  }
  const response = await fetch('https://api.vndb.org/kana/release', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filters,
      fields: 'id,alttitle,title,languages{lang},vns{alttitle,title},producers{id,name,original,aliases,developer},has_ero',
      sort: 'released',
      results: 100,
      page,
      count: true,
    }),
  })

  if (!response.ok) {
    throw new Error(`Error fetching release info: ${response.statusText}`)
  }

  return await response.json()
}

interface VnInfoOptions {
  date?: string
  id?: string
  page?: number
}

interface VnInfo {
  count: number
  more: boolean
  results: Array<{
    id: string
    title: string
    alttitle: string | null
    titles: Array<{
      title: string
      lang: string
    }>
    aliases: string[]
    image: {
      thumbnail: string
      sexual: number
      url: string
      violence: number
    } | null
    developers: Array<{
      id: string
      name: string
      original: string | null
      aliases: string[]
    }>
  }>
}

async function getVnInfo ({ date, id, page = 1 }: VnInfoOptions): Promise<VnInfo> {
  const filters: string[] = []
  if (date !== undefined) {
    filters.push('released', '=', date)
  }
  if (id !== undefined) {
    filters.push('id', '=', id)
  }
  const response = await fetch('https://api.vndb.org/kana/vn', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filters,
      fields: 'id,alttitle,titles{title,lang},title,aliases,image{thumbnail,sexual,url,violence},developers{id,name,original,aliases}',
      sort: 'released',
      results: 100,
      page,
      count: true,
    }),
  })

  if (!response.ok) {
    throw new Error(`Error vn info: ${response.statusText}`)
  }

  return await response.json()
}

export {
  getReleaseInfo, getVnInfo,
}
