// 定义 API 接口的类型
import type { Message } from './message'
import type { ApiActionName } from './req'

interface ResponseDataMap {
  'send_private_msg': SendPrivateMsgResponseData
  'send_group_msg': SendGroupMsgResponseData
  'send_msg': SendMsgResponseData
  'delete_msg': null
  'get_msg': GetMsgResponseData
  'get_forward_msg': GetForwardMsgResponseData
  'send_like': null
  'set_group_kick': null
  'set_group_ban': null
  'set_group_anonymous_ban': null
  'set_group_whole_ban': null
  'set_group_admin': null
  'set_group_anonymous': null
  'set_group_card': null
  'set_group_name': null
  'set_group_leave': null
  'set_group_special_title': null
  'set_friend_add_request': null
  'set_group_add_request': null
  'get_login_info': GetLoginInfoResponseData
  'get_stranger_info': GetStrangerInfoResponseData
  'get_friend_list': GetFriendListResponseData
  'get_group_info': GetGroupInfoResponseData
  'get_group_list': GetGroupListResponseData
  'get_group_member_info': GetGroupMemberInfoResponseData
  'get_group_member_list': GetGroupMemberListResponseData
  'get_group_honor_info': GetGroupHonorInfoResponseData
  'get_cookies': GetCookiesResponseData
  'get_csrf_token': GetCsrfTokenResponseData
  'get_credentials': GetCredentialsResponseData
  'get_record': GetRecordResponseData
  'get_image': GetImageResponseData
  'can_send_image': CanSendImageResponseData
  'can_send_record': CanSendRecordResponseData
  'get_status': GetStatusResponseData
  'get_version_info': GetVersionInfoResponseData
  'set_restart': null
  'clean_cache': null
}

export enum ApiResponseStatus { OK = 'ok', FAILED = 'failed' }

export interface ApiResponse<S extends ApiResponseStatus = ApiResponseStatus, T extends ApiActionName = ApiActionName> {
  status: S
  retcode: number
  data: S extends ApiResponseStatus.OK ? ResponseDataMap[T] : null
  message: string
  echo: string
}

// 发送私聊消息
export interface SendPrivateMsgResponseData {
  message_id: number
}

// 发送群消息
export interface SendGroupMsgResponseData {
  message_id: number
}

// 发送消息
export interface SendMsgResponseData {
  message_id: number
}

// 获取消息
export interface GetMsgResponseData {
  time: number
  message_type: string
  message_id: number
  real_id: number
  sender: Record<string, any>
  message: Message
}

// 获取合并转发消息
export interface GetForwardMsgResponseData {
  message: Message
}

// 获取登录号信息
export interface GetLoginInfoResponseData {
  user_id: number
  nickname: string
}

// 获取陌生人信息
export interface GetStrangerInfoResponseData {
  user_id: number
  nickname: string
  sex: 'male' | 'female' | 'unknown'
  age: number
}

// 获取好友列表
export interface GetFriendListResponseData {
  user_id: number
  nickname: string
  remark: string
}

// 获取群信息
export interface GetGroupInfoResponseData {
  group_id: number
  group_name: string
  member_count: number
  max_member_count: number
}

// 获取群列表
export type GetGroupListResponseData = GetGroupInfoResponseData[]

// 获取群成员信息
export interface GetGroupMemberInfoResponseData {
  group_id: number
  user_id: number
  nickname: string
  card: string
  sex: 'male' | 'female' | 'unknown'
  age: number
  area: string
  join_time: number
  last_sent_time: number
  level: string
  role: 'owner' | 'admin' | 'member'
  unfriendly: boolean
  title: string
  title_expire_time: number
  card_changeable: boolean
}

// 获取群成员列表
export type GetGroupMemberListResponseData = GetGroupMemberInfoResponseData[]

// 获取群荣誉信息
export interface GetGroupHonorInfoResponseData {
  group_id: number
  current_talkative?: {
    user_id: number
    nickname: string
    avatar: string
    day_count: number
  }
  talkative_list?: Array<{
    user_id: number
    nickname: string
    avatar: string
    description: string
  }>
  performer_list?: Array<{
    user_id: number
    nickname: string
    avatar: string
    description: string
  }>
  legend_list?: Array<{
    user_id: number
    nickname: string
    avatar: string
    description: string
  }>
  strong_newbie_list?: Array<{
    user_id: number
    nickname: string
    avatar: string
    description: string
  }>
  emotion_list?: Array<{
    user_id: number
    nickname: string
    avatar: string
    description: string
  }>
}

// 获取 Cookies
export interface GetCookiesResponseData {
  cookies: string
}

// 获取 CSRF Token
export interface GetCsrfTokenResponseData {
  token: number
}

// 获取 QQ 相关接口凭证
export interface GetCredentialsResponseData {
  cookies: string
  csrf_token: number
}

// 获取语音
export interface GetRecordResponseData {
  file: string
}

// 获取图片
export interface GetImageResponseData {
  file: string
}

// 检查是否可以发送图片
export interface CanSendImageResponseData {
  yes: boolean
}

// 检查是否可以发送语音
export interface CanSendRecordResponseData {
  yes: boolean
}

// 获取运行状态
export interface GetStatusResponseData {
  online: boolean | null
  good: boolean
  [key: string]: any
}

// 获取版本信息
export interface GetVersionInfoResponseData {
  app_name: string
  app_version: string
  protocol_version: string
  [key: string]: any
}
