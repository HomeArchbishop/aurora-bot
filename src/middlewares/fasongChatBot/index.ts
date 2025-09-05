import { ChatMiddleware, ChatMode } from '../../chat'
import preset from './preset'
import { LLM } from '../../llm/llm'
import { refreshKeyCommand, shutupCommand } from './commands/chores'
import { clearEquipmentCommand, countEquipmentCommand, equipCommand, listEquipmentCommand, unequipCommand } from './commands/equipments'
import { clearHistoryCommand, cntHistoryCommand, delHistoryCommand, historyCommand } from './commands/history'
import { presetPreProcessor } from './processors/presetPreProcessor'
import { replyProcessor } from './processors/replyProcessor'
import { tempEnableCommand } from './superCommands/tempenable'

const llm = new LLM({
  apiHost: process.env.LLM_API_HOST,
  keys: process.env.LLM_API_KEYS.split(',').map(key => key.trim()),
  // model: 'deepseek-chat',
  // model: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B'
  model: 'deepseek-ai/DeepSeek-V3',
  temperature: 1.3,
  topP: 0.8,
})

export const [fasongChatBot, fasong2ChatBot] =
  new ChatMiddleware('fasongChatBot')
    .usePreset(preset)
    .useLLM(llm)
    .useMaster(Number(process.env.CHATBOT_FASONG_MASTER_ID))
    .setPresetHistoryInjectionCount(100)

    .addPresetPreprocessor(presetPreProcessor)
    .addReplyProcessor(replyProcessor)

    .addCommand(clearHistoryCommand)
    .addCommand(historyCommand)
    .addCommand(delHistoryCommand)
    .addCommand(cntHistoryCommand)

    .addCommand(equipCommand)
    .addCommand(unequipCommand)
    .addCommand(clearEquipmentCommand)
    .addCommand(countEquipmentCommand)
    .addCommand(listEquipmentCommand)

    .addCommand(shutupCommand)
    .addCommand(refreshKeyCommand)

    .fork([
      fork1 => fork1
        .enablePrivate(Number(process.env.MASTER_ID))
        .enableGroup(Number(process.env.MISC_GROUP_ID_PAISHE), { rate: 0.03, replyOnAt: true }) // 牌社
        .enableGroup(Number(process.env.MISC_GROUP_ID_ABC), { rate: 1, replyOnAt: true }) // abc
        .enableGroup(Number(process.env.MISC_GROUP_ID_JISHUZU), { rate: 0.05, replyOnAt: true }) // 技术组
        .enableGroup(Number(process.env.MISC_GROUP_ID_528), { rate: 0.4, replyOnAt: true }) // 528
        .enableGroup(Number(process.env.MISC_GROUP_ID_YANGGU), { rate: 1, replyOnAt: true }) // yanggu
        .enableGroup(Number(process.env.MISC_GROUP_ID_KINDERGARTEN), { rate: 0.4, replyOnAt: true }) // 幼儿园
        .enableGroup(Number(process.env.MISC_GROUP_ID_NULIXUEXI), { rate: 0.4, replyOnAt: true }) // 努力学习
        .enableGroup(Number(process.env.MISC_GROUP_ID_SHANXIA), { rate: 0.02, replyOnAt: true }) // 山下
        .addSuperCommand(tempEnableCommand)
        .bubble,
      fork2 => fork2
        .useChatMode(ChatMode.SingleLineReply)
        .enableGroup(Number(process.env.MISC_GROUP_ID_JIAYUAN), { rate: 0.02, replyOnAt: true }) // 家园&冰岩
        .bubble,
    ])
    .buildAll()
