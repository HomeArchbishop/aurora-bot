import { ChatbotBuilder, ChatMode } from '@/extensions/chat'
import { LLM } from '@/extensions/llm'
import preset from './preset'
import { refreshKeyCommand, shutupCommand } from './commands/chores'
import { clearEquipmentCommand, countEquipmentCommand, equipCommand, listEquipmentCommand, unequipCommand } from './commands/equipments'
import { clearHistoryCommand, cntHistoryCommand, delHistoryCommand, historyCommand } from './commands/history'
import { replyDecorator } from './plugins/reply-decorator'
import { tempEnableCommand } from './super-commands/tempenable'
import { useDatabase } from '@/db'
import { promptDecorator } from './plugins/prompt-decorator'
import { messageStringParser } from './plugins/message-string-parser'

const llm = new LLM({
  platform: process.env.LLM_PLATFORM,
  apiHost: process.env.LLM_API_HOST,
  keys: process.env.LLM_API_KEYS.split(',').map(key => key.trim()),
  model: process.env.CHATBOT_FASONG_LLM_MODEL,
  temperature: 1.3,
  topP: 0.8,
})

const db = useDatabase()

export const [fasongChatBot, fasong2ChatBot] =
  new ChatbotBuilder('fasongChatBot')
    .usePreset(preset)
    .useLLM(llm)
    .useDb(db)
    .useMaster(Number(process.env.CHATBOT_FASONG_MASTER_ID))

    .useCommand(clearHistoryCommand)
    .useCommand(historyCommand)
    .useCommand(delHistoryCommand)
    .useCommand(cntHistoryCommand)

    .useCommand(equipCommand)
    .useCommand(unequipCommand)
    .useCommand(clearEquipmentCommand)
    .useCommand(countEquipmentCommand)
    .useCommand(listEquipmentCommand)

    .useCommand(shutupCommand)
    .useCommand(refreshKeyCommand)

    .useMessageStringParser(messageStringParser)
    .usePromptDecorator(promptDecorator)
    .useReplyDecorator(replyDecorator)

    .fork([
      fork1 => fork1
        .enablePrivate(Number(process.env.MASTER_ID))
        .enableGroup(Number(process.env.MISC_GROUP_ID_PAISHE), { rate: 0.03, replyOnAt: true }) // 牌社
        .enableGroup(Number(process.env.MISC_GROUP_ID_ABC), { rate: 1, replyOnAt: true }) // abc
        .enableGroup(Number(process.env.MISC_GROUP_ID_JISHUZU), { rate: 0.05, replyOnAt: true }) // 技术组
        .enableGroup(Number(process.env.MISC_GROUP_ID_528), { rate: 0.4, replyOnAt: true }) // 528
        .enableGroup(Number(process.env.MISC_GROUP_ID_YANGGU), { rate: 1, replyOnAt: true }) // yanggu
        .enableGroup(Number(process.env.MISC_GROUP_ID_KINDERGARTEN), { rate: 0.1, replyOnAt: true }) // 幼儿园
        .enableGroup(Number(process.env.MISC_GROUP_ID_NULIXUEXI), { rate: 0.4, replyOnAt: true }) // 努力学习
        .enableGroup(Number(process.env.MISC_GROUP_ID_SHANXIA), { rate: 0.02, replyOnAt: true }) // 山下
        .enableGroup(Number(process.env.MISC_GROUP_ID_4886), { rate: 0.4, replyOnAt: true }) // 4886
        .enableGroup(Number(process.env.MISC_GROUP_ID_NEW528), { rate: 0.05, replyOnAt: true }) // new 528
        .useSuperCommand(tempEnableCommand)
        .bubble,
      fork2 => fork2
        .useChatMode(ChatMode.SingleLineReply)
        .enableGroup(Number(process.env.MISC_GROUP_ID_JIAYUAN), { rate: 0.02, replyOnAt: true }) // 家园&冰岩
        .bubble,
    ])
    .buildAll()
