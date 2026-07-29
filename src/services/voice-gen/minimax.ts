import { trimWavEnd } from '@/utils/wav-slice'

interface VoiceGenOptions {
  text: string
  voiceId: string
}

interface VoiceGenResult {
  buffer: Buffer
  originalUrl: string
}

export async function generateVoiceMinimax ({ text, voiceId }: VoiceGenOptions): Promise<VoiceGenResult> {
  const body = JSON.stringify({
    text,
    stream: false,
    audio_setting: {
      format: 'wav',
      bitrate: 128000,
      channel: 1,
      force_cbr: false,
      sample_rate: 32000,
    },
    output_format: 'url',
    voice_setting: {
      vol: 1,
      pitch: 0,
      speed: 1,
      voice_id: voiceId, // taffy 'voice_497db616-b807-4baa-8b2a-283c2355b7ad',
      latex_read: true,
      text_normalization: true,
    },
    aigc_watermark: true,
    stream_options: {
      exclude_aggregated_audio: false,
    },
    subtitle_enable: false,
    continuous_sound: true,
    pronunciation_dict: {
      tone: ['永雏塔菲/taffy'],
    },
  })

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.PPINFRA_API_TOKEN}`,
    },
    body,
  }

  const response = await fetch('https://api.ppio.com/v3/minimax-speech-2.8-turbo', options)
  const data = await response.json()
  const url = data.data.audio
  const audioResponse = await fetch(url)
  const audioBuffer = await audioResponse.arrayBuffer()
  return {
    buffer: trimWavEnd(Buffer.from(audioBuffer), 1000),
    originalUrl: url,
  }
}
