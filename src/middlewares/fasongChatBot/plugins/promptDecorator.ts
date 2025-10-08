import { createPromptDecorator } from '@/extends/chat'

export const promptDecorator = createPromptDecorator(async (prompt, ctx) => {
  return prompt
    .replace(/{{time_now}}/g, `${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}(24小时制)`)
    .replace(/{{history_injection}}/g, ctx.domain.db.getSync(ctx.domain.dbKey.history)?.split('\n').slice(-70).join('\n') ?? '')
    .replace(/{{equipment}}/g, ctx.domain.db.getSync(ctx.domain.dbKey.equipment) ?? '(no equipment)')
})
