import { useDatabase } from '@/db'
import { createMiddleware } from 'aurorax'

export const dbManager = createMiddleware('dbManager', async (ctx, next) => {
  if (ctx.event.post_type !== 'message' || ctx.event.user_id !== Number(process.env.MASTER_ID)) {
    return await next()
  }

  const allowSubCmd = [
    'rm',
    'get',
    'set',
    'len',
  ]

  const cmd = ctx.event.raw_message.trim().split(/\s+/)
  if (cmd[0] !== 'db' || !allowSubCmd.includes(cmd[1])) {
    return await next()
  }

  const args = cmd.slice(2)
  const db = useDatabase()

  let result = ctx.event.raw_message + '\n\n--------------------------------\n\n'
  try {
    switch (cmd[1]) {
      case 'rm':
        db.del(args[0])
        result += `已删除 ${args[0]}`
        break
      case 'get':
        result += `已获取 ${args[0]}: ${await db.get(args[0])}`
        break
      case 'set':
        db.put(args[0], args[1])
        result += `已设置 ${args[0]} = ${args[1]}`
        break
      case 'len':
        result += `数据库长度: ${(await db.get(args[0])).toString().length}`
        break
    }
  } catch (error) {
    result += `错误: ${error}`
  }

  if (ctx.event.message_type === 'group') {
    ctx.send({
      action: 'send_group_msg',
      params: {
        group_id: ctx.event.group_id,
        message: '出于安全保护，结果会发给 master。请联系 master 查看。',
      },
    })
  }

  ctx.send({
    action: 'send_private_msg',
    params: {
      user_id: Number(process.env.MASTER_ID),
      message: result,
    },
  })
})
