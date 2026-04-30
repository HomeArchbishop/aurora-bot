import type { GeneratedImage, Image2ImageParams, ImageGeneratorProvider, Text2ImageParams } from './interface'

export class PpioSeedream50Lite implements ImageGeneratorProvider {
  async text2image (params: Text2ImageParams): Promise<GeneratedImage> {
    const response = await fetch('https://api.ppio.ai/v1/images/text2image', {
      method: 'POST',
      body: JSON.stringify(params),
    })
    return response.json()
  }

  async image2image (params: Image2ImageParams): Promise<GeneratedImage> {
    const response = await fetch('https://api.ppio.ai/v1/images/image2image', {
      method: 'POST',
      body: JSON.stringify(params),
    })
    return response.json()
  }
}
