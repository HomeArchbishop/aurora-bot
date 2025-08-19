import { createPresetPreprocessor } from '../../../chat/processor'

export const presetPreProcessor = createPresetPreprocessor(async preset => {
  preset.addReplaceOnce([/{{time_now}}/g, `${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}(24小时制)`])
})
