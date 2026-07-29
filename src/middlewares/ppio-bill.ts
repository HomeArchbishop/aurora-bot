import { createDynamicSendMessageRequest } from '@/utils/onebot-utils'
import { createMiddleware } from 'aurorax'
import minimist from 'minimist'

const MASTER_ID = process.env.MASTER_ID

export const ppioBill = createMiddleware('ppioBill', async (ctx, next) => {
  const event = ctx.event
  if (event.post_type !== 'message') {
    return await next()
  }
  const privateHit = event.message_type === 'private' && event.user_id === Number(MASTER_ID)
  const { _: [instruction], d: days, k: apikeyName } = minimist(event.raw_message.split(' '), {
    string: ['d', 'k'],
    default: {
      d: 7,
      k: '',
    },
  })
  const commandHit = instruction === '#ppiobill'

  const hit = privateHit && commandHit
  if (!hit) {
    return await next()
  }

  const secOfDayBegin = (s: number) => {
    const date = new Date(s * 1000)
    date.setHours(0, 0, 0, 0)
    return ~~(date.getTime() / 1000)
  }

  const query = new URLSearchParams({
    cycleType: 'Day',
    productCategory: 'llm',
    startTime: secOfDayBegin(~~(Date.now() / 1000) - (days - 1) * 24 * 3600).toString(),
    endTime: secOfDayBegin(~~(Date.now() / 1000) + 1 * 24 * 3600).toString(),
  })

  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.PPINFRA_API_TOKEN}`,
    },
  } as RequestInit

  try {
    const resp = await fetch(`https://api.ppio.com/openapi/v1/billing/apikey/bill/list?${query}`, options)
    const data = await resp.json()

    const date = (x: number) => new Date(x * 1000).getDate()
    const month = (x: number) => new Date(x * 1000).getMonth() + 1
    const dateStr = (x: number) => `${month(x)}/${date(x)}`

    const formateNum = (x: number) => {
      if (x < 1000) {
        return x
      } else if (x < 1000000) {
        return `${(x / 1000).toFixed(2)}k`
      } else {
        return `${(x / 1000000).toFixed(2)}M`
      }
    }

    const list = apikeyName ? data.bills.filter((item: any) => item.apikeyName === apikeyName) : data.bills

    const inputTokens = (item: any) => Number(item.billNum0) + Number(item.billNum2) + Number(item.billNum3)
    const outputTokens = (item: any) => Number(item.billNum1)

    const totalAmount = list.reduce((p: number, c: any) => p + Number(c.amount), 0)
    const totalInputTokens = list.reduce((p: number, c: any) => p + inputTokens(c), 0)
    const totalOutputTokens = list.reduce((p: number, c: any) => p + outputTokens(c), 0)

    const segs = list.map((item: any) => ({
      type: 'text',
      data: {
        text: `${item.apikeyName} ${item.productName} [¥${+item.amount / 10000}] ${formateNum(inputTokens(item))}in ${formateNum(outputTokens(item))}out (${dateStr(+item.startTime)})\n`,
      },
    }))

    segs.push({
      type: 'text',
      data: {
        text: `总计: ¥${totalAmount / 10000} in${formateNum(totalInputTokens)} out${formateNum(totalOutputTokens)}`,
      },
    })

    ctx.send(createDynamicSendMessageRequest(event, segs))
  } catch (error) {
    ctx.send(createDynamicSendMessageRequest(event, [
      { type: 'text', data: { text: `获取失败: ${error instanceof Error ? error.message : String(error)}` } },
    ]))
  }
})
