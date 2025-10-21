import type { ApiRequest, MessageEvent, MessageSegmentReceive, MessageSend } from 'aurorax'

export const extractPureText = (message: MessageSegmentReceive[]) => {
  return message.reduce<string[]>((acc, seg) => {
    if (seg.type === 'text') {
      acc.push(seg.data.text)
    }
    return acc
  }, []).join(' ').trim()
}

export function createMessageSend<T extends MessageSend> (message: T): T {
  return message
}

export function createDynamicSendMessageRequest (event: MessageEvent, message: MessageSend):
Omit<ApiRequest<'send_private_msg' | 'send_group_msg'>, 'echo'> {
  if (event.message_type === 'private') {
    return {
      action: 'send_private_msg',
      params: {
        user_id: event.user_id,
        message,
      },
    }
  }
  return {
    action: 'send_group_msg',
    params: {
      group_id: event.group_id,
      message,
    },
  }
}
