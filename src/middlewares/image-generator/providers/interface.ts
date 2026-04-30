export interface Text2ImageParams {
  prompt: string
  size: {
    width: number
    height: number
  }
}

export interface Image2ImageParams {
  image: string
  prompt: string
  size: {
    width: number
    height: number
  }
}

export interface GeneratedImage {
  url: string
}

export interface ImageGeneratorProvider {
  text2image (params: Text2ImageParams): Promise<GeneratedImage>
  image2image (params: Image2ImageParams): Promise<GeneratedImage>
}
