// 定义 API 接口的类型
import type { Message } from './message'

type RequestActionName = 'send_private_msg'
| 'send_group_msg'
| 'send_msg'
| 'delete_msg'
| 'get_msg'
| 'get_forward_msg'
| 'send_like'
| 'set_group_kick'
| 'set_group_ban'
| 'set_group_anonymous_ban'
| 'set_group_whole_ban'
| 'set_group_admin'
| 'set_group_anonymous'
| 'set_group_card'
| 'set_group_name'
| 'set_group_leave'
| 'set_group_special_title'
| 'set_friend_add_request'
| 'set_group_add_request'
| 'get_login_info'
| 'get_stranger_info'
| 'get_friend_list'
| 'get_group_info'
| 'get_group_list'
| 'get_group_member_info'
| 'get_group_member_list'
| 'get_group_honor_info'
| 'get_cookies'
| 'get_csrf_token'
| 'get_credentials'
| 'get_record'
| 'get_image'
| 'can_send_image'
| 'can_send_record'
| 'get_status'
| 'get_version_info'
| 'set_restart'
| 'clean_cache'
| 'get_credentials'
| 'get_cookies'
| 'get_csrf_token'
| 'get_record'
| 'get_image'
| 'can_send_image'
| 'can_send_record'
| 'get_status'
| 'get_version_info'
| 'set_restart'
| 'clean_cache'

type ApiRequestParams = SendPrivateMsgParams
| SendGroupMsgParams
| SendMsgParams
| DeleteMsgParams
| GetMsgParams
| GetForwardMsgParams
| SendLikeParams
| SetGroupKickParams
| SetGroupBanParams
| SetGroupAnonymousBanParams
| SetGroupWholeBanParams
| SetGroupAdminParams
| SetGroupAnonymousParams
| SetGroupCardParams
| SetGroupNameParams
| SetGroupLeaveParams
| SetGroupSpecialTitleParams
| SetFriendAddRequestParams
| SetGroupAddRequestParams
| GetStrangerInfoParams
| GetGroupInfoParams
| GetGroupMemberInfoParams
| GetGroupMemberListParams
| GetGroupHonorInfoParams
| GetCookiesParams
| GetCredentialsParams
| GetRecordParams
| GetImageParams
| SetRestartParams
| CleanCacheParams

export interface ApiRequest {
  action: RequestActionName
  params?: ApiRequestParams
  echo: string | number
}

// 发送私聊消息
export interface SendPrivateMsgParams {
  user_id: number
  message: Message
  auto_escape?: boolean
}

export interface SendPrivateMsgResponse {
  message_id: number
}

// 发送群消息
export interface SendGroupMsgParams {
  group_id: number
  message: Message
  auto_escape?: boolean
}

export interface SendGroupMsgResponse {
  message_id: number
}

// 发送消息
export interface SendMsgParams {
  message_type?: 'private' | 'group'
  user_id?: number
  group_id?: number
  message: Message
  auto_escape?: boolean
}

export interface SendMsgResponse {
  message_id: number
}

// 撤回消息
export interface DeleteMsgParams {
  message_id: number
}

// 获取消息
export interface GetMsgParams {
  message_id: number
}

export interface GetMsgResponse {
  time: number
  message_type: string
  message_id: number
  real_id: number
  sender: Record<string, any>
  message: Message
}

// 获取合并转发消息
export interface GetForwardMsgParams {
  id: string
}

export interface GetForwardMsgResponse {
  message: Message
}

// 发送好友赞
export interface SendLikeParams {
  user_id: number
  times?: number
}

// 群组踢人
export interface SetGroupKickParams {
  group_id: number
  user_id: number
  reject_add_request?: boolean
}

// 群组单人禁言
export interface SetGroupBanParams {
  group_id: number
  user_id: number
  duration?: number
}

// 群组匿名用户禁言
export interface SetGroupAnonymousBanParams {
  group_id: number
  anonymous?: Record<string, any>
  anonymous_flag?: string
  duration?: number
}

// 群组全员禁言
export interface SetGroupWholeBanParams {
  group_id: number
  enable?: boolean
}

// 群组设置管理员
export interface SetGroupAdminParams {
  group_id: number
  user_id: number
  enable?: boolean
}

// 群组匿名
export interface SetGroupAnonymousParams {
  group_id: number
  enable?: boolean
}

// 设置群名片（群备注）
export interface SetGroupCardParams {
  group_id: number
  user_id: number
  card?: string
}

// 设置群名
export interface SetGroupNameParams {
  group_id: number
  group_name: string
}

// 退出群组
export interface SetGroupLeaveParams {
  group_id: number
  is_dismiss?: boolean
}

// 设置群组专属头衔
export interface SetGroupSpecialTitleParams {
  group_id: number
  user_id: number
  special_title?: string
  duration?: number
}

// 处理加好友请求
export interface SetFriendAddRequestParams {
  flag: string
  approve?: boolean
  remark?: string
}

// 处理加群请求／邀请
export interface SetGroupAddRequestParams {
  flag: string
  sub_type: 'add' | 'invite'
  approve?: boolean
  reason?: string
}

// 获取登录号信息
export interface GetLoginInfoResponse {
  user_id: number
  nickname: string
}

// 获取陌生人信息
export interface GetStrangerInfoParams {
  user_id: number
  no_cache?: boolean
}

export interface GetStrangerInfoResponse {
  user_id: number
  nickname: string
  sex: 'male' | 'female' | 'unknown'
  age: number
}

// 获取好友列表
export interface GetFriendListResponse {
  user_id: number
  nickname: string
  remark: string
}

// 获取群信息
export interface GetGroupInfoParams {
  group_id: number
  no_cache?: boolean
}

export interface GetGroupInfoResponse {
  group_id: number
  group_name: string
  member_count: number
  max_member_count: number
}

// 获取群列表
export type GetGroupListResponse = GetGroupInfoResponse[]

// 获取群成员信息
export interface GetGroupMemberInfoParams {
  group_id: number
  user_id: number
  no_cache?: boolean
}

export interface GetGroupMemberInfoResponse {
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
export interface GetGroupMemberListParams {
  group_id: number
}

export type GetGroupMemberListResponse = GetGroupMemberInfoResponse[]

// 获取群荣誉信息
export interface GetGroupHonorInfoParams {
  group_id: number
  type: 'talkative' | 'performer' | 'legend' | 'strong_newbie' | 'emotion' | 'all'
}

export interface GetGroupHonorInfoResponse {
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
export interface GetCookiesParams {
  domain?: string
}

export interface GetCookiesResponse {
  cookies: string
}

// 获取 CSRF Token
export interface GetCsrfTokenResponse {
  token: number
}

// 获取 QQ 相关接口凭证
export interface GetCredentialsParams {
  domain?: string
}

export interface GetCredentialsResponse {
  cookies: string
  csrf_token: number
}

// 获取语音
export interface GetRecordParams {
  file: string
  out_format: string
}

export interface GetRecordResponse {
  file: string
}

// 获取图片
export interface GetImageParams {
  file: string
}

export interface GetImageResponse {
  file: string
}

// 检查是否可以发送图片
export interface CanSendImageResponse {
  yes: boolean
}

// 检查是否可以发送语音
export interface CanSendRecordResponse {
  yes: boolean
}

// 获取运行状态
export interface GetStatusResponse {
  online: boolean | null
  good: boolean
  [key: string]: any
}

// 获取版本信息
export interface GetVersionInfoResponse {
  app_name: string
  app_version: string
  protocol_version: string
  [key: string]: any
}

// 重启 OneBot 实现
export interface SetRestartParams {
  delay?: number
}

// 清理缓存
export type CleanCacheParams = undefined
