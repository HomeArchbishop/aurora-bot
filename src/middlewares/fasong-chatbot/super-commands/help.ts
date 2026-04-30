import { createCommand } from '@/extensions/chat/factory'

export const helpCommand = createCommand({
  pattern: [/^#help/],
  permission: 'everyone',
  async callback ({ send, domain: { text } }, args) {
    send(text(this.getCommandHelpString()))
  },
})
