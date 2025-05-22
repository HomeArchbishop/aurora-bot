export type Message = string | MessageSegment[] | MessageSegment

export type MessageSegment =
  | TextSegment
  | FaceSegment
  | ImageSegment
  | RecordSegment
  | VideoSegment
  | AtSegment
  | RpsSegment
  | DiceSegment
  | ShakeSegment
  | PokeSegment
  | AnonymousSegment
  | ShareSegment
  | ContactSegment
  | LocationSegment
  | MusicSegment
  | ReplySegment
  | ForwardSegment
  | NodeSegment
  | XmlSegment
  | JsonSegment

// 纯文本
export interface TextSegment {
  type: 'text'
  data: {
    text: string
  }
}

// QQ 表情
export interface FaceSegment {
  type: 'face'
  data: {
    id: string
  }
}

// 图片
export interface ImageSegment {
  type: 'image'
  data: {
    file: string
    type?: 'flash'
    sub_type?: 0 | 1 // 0: 普通图片, 1: 表情包图片
    url?: string
    cache?: '0' | '1'
    proxy?: '0' | '1'
    timeout?: number
  }
}

// 语音
export interface RecordSegment {
  type: 'record'
  data: {
    file: string
    magic?: '0' | '1'
    url?: string
    cache?: '0' | '1'
    proxy?: '0' | '1'
    timeout?: number
  }
}

// 短视频
export interface VideoSegment {
  type: 'video'
  data: {
    file: string
    url?: string
    cache?: '0' | '1'
    proxy?: '0' | '1'
    timeout?: number
  }
}

// @某人
export interface AtSegment {
  type: 'at'
  data: {
    qq: string
  }
}

// 猜拳魔法表情
export interface RpsSegment {
  type: 'rps'
  data: Record<string, unknown>
}

// 掷骰子魔法表情
export interface DiceSegment {
  type: 'dice'
  data: Record<string, unknown>
}

// 窗口抖动（戳一戳）
export interface ShakeSegment {
  type: 'shake'
  data: Record<string, unknown>
}

// 戳一戳
export interface PokeSegment {
  type: 'poke'
  data: {
    type: string
    id: string
    name?: string
  }
}

// 匿名发消息
export interface AnonymousSegment {
  type: 'anonymous'
  data: {
    ignore?: '0' | '1'
  }
}

// 链接分享
export interface ShareSegment {
  type: 'share'
  data: {
    url: string
    title: string
    content?: string
    image?: string
  }
}

// 推荐好友或群
export interface ContactSegment {
  type: 'contact'
  data: {
    type: 'qq' | 'group'
    id: string
  }
}

// 位置
export interface LocationSegment {
  type: 'location'
  data: {
    lat: string
    lon: string
    title?: string
    content?: string
  }
}

// 音乐分享
export interface MusicSegment {
  type: 'music'
  data: {
    type: 'qq' | '163' | 'xm' | 'custom'
    id?: string
    url?: string
    audio?: string
    title?: string
    content?: string
    image?: string
  }
}

// 回复
export interface ReplySegment {
  type: 'reply'
  data: {
    id: string
  }
}

// 合并转发
export interface ForwardSegment {
  type: 'forward'
  data: {
    id: string
  }
}

// 合并转发节点
export interface NodeSegment {
  type: 'node'
  data: {
    id?: string
    user_id?: string
    nickname?: string
    content?: string | MessageSegment[]
  }
}

// XML 消息
export interface XmlSegment {
  type: 'xml'
  data: {
    data: string
  }
}

// JSON 消息
export interface JsonSegment {
  type: 'json'
  data: {
    data: string
  }
}
