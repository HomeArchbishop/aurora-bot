export enum LlmPlatform {
  OpenAI = 'openai',
  Anthropic = 'anthropic',
}

interface ChatTextPart {
  type: 'text';
  text: string;
}

interface ChatImageUrlPart {
  type: 'image_url';
  image_url: {
    url: string;
  };
}

type ChatContentPart = ChatTextPart | ChatImageUrlPart

export interface LlmInputMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | ChatContentPart[]
}
