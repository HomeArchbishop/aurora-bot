import type { MessageSegment } from './message'

export type PostType = 'message' | 'notice' | 'request' | 'meta_event'

export type MetaEvent =
  | LifecycleMetaEvent
  | HeartbeatMetaEvent

export type NoticeEvent =
  | FriendAddNoticeEvent
  | GroupUploadNoticeEvent
  | GroupAdminNoticeEvent
  | GroupDecreaseNoticeEvent
  | GroupIncreaseNoticeEvent
  | GroupBanNoticeEvent
  | GroupRecallNoticeEvent
  | FriendRecallNoticeEvent
  | GroupPokeNoticeEvent
  | GroupLuckyKingNoticeEvent
  | GroupHonorChangeNoticeEvent

export type RequestEvent =
  | FriendRequestEvent
  | GroupRequestEvent

export type MessageEvent =
  | PrivateMessageEvent
  | GroupMessageEvent

export type Event =
  | MetaEvent
  | NoticeEvent
  | RequestEvent
  | MessageEvent

export interface LifecycleMetaEvent {
  time: number
  self_id: number
  post_type: 'meta_event'
  meta_event_type: 'lifecycle'
  sub_type: 'enable' | 'disable' | 'connect'
}

export interface HeartbeatMetaEvent {
  time: number
  self_id: number
  post_type: 'meta_event'
  meta_event_type: 'heartbeat'
  status: Record<string, unknown>
  interval: number
}

export interface GroupUploadNoticeEvent {
  time: number
  self_id: number
  post_type: 'notice'
  notice_type: 'group_upload'
  group_id: number
  user_id: number
  file: {
    id: string
    name: string
    size: number
    busid: number
  }
}

export interface GroupAdminNoticeEvent {
  time: number
  self_id: number
  post_type: 'notice'
  notice_type: 'group_admin'
  sub_type: 'set' | 'unset'
  group_id: number
  user_id: number
}

export interface GroupDecreaseNoticeEvent {
  time: number
  self_id: number
  post_type: 'notice'
  notice_type: 'group_decrease'
  sub_type: 'leave' | 'kick' | 'kick_me'
  group_id: number
  operator_id: number
  user_id: number
}

export interface GroupIncreaseNoticeEvent {
  time: number
  self_id: number
  post_type: 'notice'
  notice_type: 'group_increase'
  sub_type: 'approve' | 'invite'
  group_id: number
  operator_id: number
  user_id: number
}

export interface GroupBanNoticeEvent {
  time: number
  self_id: number
  post_type: 'notice'
  notice_type: 'group_ban'
  sub_type: 'ban' | 'lift_ban'
  group_id: number
  operator_id: number
  user_id: number
  duration: number
}

export interface FriendAddNoticeEvent {
  time: number
  self_id: number
  post_type: 'notice'
  notice_type: 'friend_add'
  user_id: number
}

export interface GroupRecallNoticeEvent {
  time: number
  self_id: number
  post_type: 'notice'
  notice_type: 'group_recall'
  group_id: number
  user_id: number
  operator_id: number
  message_id: number
}

export interface FriendRecallNoticeEvent {
  time: number
  self_id: number
  post_type: 'notice'
  notice_type: 'friend_recall'
  user_id: number
  message_id: number
}

export interface GroupPokeNoticeEvent {
  time: number
  self_id: number
  post_type: 'notice'
  notice_type: 'notify'
  sub_type: 'poke'
  group_id: number
  user_id: number
  target_id: number
}

export interface GroupLuckyKingNoticeEvent {
  time: number
  self_id: number
  post_type: 'notice'
  notice_type: 'notify'
  sub_type: 'lucky_king'
  group_id: number
  user_id: number
  target_id: number
}

export interface GroupHonorChangeNoticeEvent {
  time: number
  self_id: number
  post_type: 'notice'
  notice_type: 'notify'
  sub_type: 'honor'
  group_id: number
  honor_type: 'talkative' | 'performer' | 'emotion'
  user_id: number
}

export interface FriendRequestEvent {
  time: number
  self_id: number
  post_type: 'request'
  request_type: 'friend'
  user_id: number
  comment: string
  flag: string
}

export interface GroupRequestEvent {
  time: number
  self_id: number
  post_type: 'request'
  request_type: 'group'
  sub_type: 'add' | 'invite'
  group_id: number
  user_id: number
  comment: string
  flag: string
}

export interface PrivateMessageEvent {
  time: number
  self_id: number
  post_type: 'message'
  message_type: 'private'
  sub_type: 'friend' | 'group' | 'other'
  message_id: number
  user_id: number
  message: MessageSegment[]
  raw_message: string
  font: number
  sender: {
    user_id?: number
    nickname?: string
    sex?: 'male' | 'female' | 'unknown'
    age?: number
  }
}

export interface GroupMessageEvent {
  time: number
  self_id: number
  post_type: 'message'
  message_type: 'group'
  sub_type: 'normal' | 'anonymous' | 'notice'
  message_id: number
  group_id: number
  user_id: number
  anonymous: {
    id: number
    name: string
    flag: string
  } | null
  message: MessageSegment[]
  raw_message: string
  font: number
  sender: {
    user_id?: number
    nickname?: string
    card?: string
    sex?: 'male' | 'female' | 'unknown'
    age?: number
    area?: string
    level?: string
    role: 'owner' | 'admin' | 'member'
    title?: string
  }
}
