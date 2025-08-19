import { Preset } from './preset'
import { ReplyRequestSplits } from './share.types'

export type PresetPreprocessorFn = (preset: Preset) => Promise<void>
export type ReplyProcessorFn = (splits: ReplyRequestSplits[]) => Promise<ReplyRequestSplits[]>

export function createPresetPreprocessor (p: PresetPreprocessorFn): PresetPreprocessorFn {
  return p
}

export function createReplyProcessor (p: ReplyProcessorFn): ReplyProcessorFn {
  return p
}
