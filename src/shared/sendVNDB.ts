import { type createJob, type createMiddleware } from '../app'
import { getReleaseInfo, getVnInfo } from './getVNDB'

function getFlagEmoji (countryCode: string): string {
  return {
    ja: '🇯🇵',
    'zh-Hans': '🇨🇳',
    'zh-Hant': '🇭🇰',
    en: '🇬🇧',
    kr: '🇰🇷',
    ru: '🇷🇺'
  }[countryCode] ?? countryCode
}

interface SendVNReleaseOptions {
  date: string
  isGroup: boolean
  eventId: number
}

async function sendVNRelease ({ date, isGroup, eventId }: SendVNReleaseOptions, ctx: Parameters<ReturnType<typeof createMiddleware> | ReturnType<typeof createJob>[1]>[0]): Promise<void> {
  try {
    const releaseInfo = await getReleaseInfo({
      date
    })
    const vnInfo = await getVnInfo({
      date
    })
    const releaseResults = releaseInfo.results
    const vnResults = vnInfo.results

    const group = new Map<string, [typeof vnResults[0] | undefined, typeof releaseResults]>()
    for (const release of releaseResults) {
      const vnId = release.vns[0].id
      if (group.has(vnId)) {
        group.get(vnId)?.[1].push(release)
      } else {
        group.set(vnId, [vnResults.find(vn => vn.id === vnId), [release]])
      }
    }

    const imgChecker = (vn: typeof vnResults[0]): boolean =>
      (vn.image?.sexual ?? 0) <= 0.6 && (vn.image?.violence ?? 0) <= 0.6

    const imgTip = (vn: typeof vnResults[0]): string =>
      '\n[封面不显示] ' + [(vn.image?.sexual ?? 0) > 0.6 ? '(18+)' : '', (vn.image?.violence ?? 0) > 0.6 ? '(violence)' : ''].join('')

    const messages: Array<[string, [string | undefined, string]]> = [] // [message, [thumbnailUrl?, imgTips]]
    messages.push([`视觉小说 ${date} 发布信息\n(数据来源：vndb)`, [undefined, '']])

    if (releaseResults.length === 0) {
      messages.push(['没有找到任何发布信息', [undefined, '']])
    }

    const newVnHasMessageFlag = new Set<string>()
    const ids = Array.from(group.keys())
    ids.sort((a, b) => {
      return Number(group.get(a)?.[0] === undefined) - Number(group.get(b)?.[0] === undefined)
    })
    for (const id of ids) {
      const [newVn, releases] = group.get(id) ?? [undefined, []]
      newVnHasMessageFlag.add(id)
      const vn = newVn ?? await getVnInfo({ id }).then(res => res.results[0])
      if (vn === undefined) {
        messages.push([`VN ID: ${id} 无法获取信息`, [undefined, '']])
        continue
      }
      messages.push([
        `${newVn !== undefined ? '(新作) ' : ''}${releases[0].vns[0].alttitle ?? releases[0].vns[0].title}\n` +
        (vn.aliases.length !== 0 ? `别名: ${vn.aliases.join(', ')}\n` : '') +
        `开发: ${vn.developers.map(dev => dev.name).join(', ')}\n` +
        '\n' +
        '[Releases]\n' +
        releases.map(release => {
          return `${release.languages.map(lang => getFlagEmoji(lang.lang)).join(' ')} ` +
                 `${release.has_ero ? '' : '[全年龄]'}${release.alttitle ?? release.title}`
        }).join('\n'),
        [
          imgChecker(vn) ? vn.image?.thumbnail : undefined,
          imgTip(vn)
        ]
      ])
    }

    for (const vn of vnResults) {
      if (newVnHasMessageFlag.has(vn.id)) continue
      messages.push([
        `(新，无 Release 信息): ${vn.id}\n` +
        `标题: ${vn.alttitle ?? vn.title}\n` +
        `别名: ${vn.aliases.join(', ')}\n` +
        `开发: ${vn.developers.map(dev => dev.name).join(', ')}\n`,
        [
          imgChecker(vn) ? vn.image?.thumbnail : undefined,
          imgTip(vn)
        ]
      ])
    }

    const max = 10
    for (let i = 0; i < messages.length; i += max) {
      ctx.send({
        action: isGroup ? 'send_group_forward_msg' : 'send_private_forward_msg',
        params: {
          user_id: eventId,
          messages: messages.slice(i, i + max).map(message => ({
            type: 'node',
            data: {
              nickname: 'vndb',
              content: [
                {
                  type: 'text',
                  data: {
                    text: message[0]
                  }
                },
                message[1][0] !== undefined
                  ? {
                      type: 'image',
                      data: {
                        file: message[1][0]
                      }
                    }
                  : {
                      type: 'text',
                      data: {
                        text: '\n' + message[1][1]
                      }
                    }
              ]
            }
          }))
        }
      })
      Bun.sleepSync(1000)
    }
  } catch (err: any) {
    ctx.send({
      action: isGroup ? 'send_group_msg' : 'send_private_msg',
      params: {
        user_id: eventId,
        message: `获取VNDB发布信息失败: ${err.message}`
      }
    })
  }
}

export { sendVNRelease }
