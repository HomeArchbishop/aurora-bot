// 定义 API 接口的类型
import type { Message } from './message'

export type ApiActionName = 'send_private_msg'
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

interface RequestParamsMap {
  'send_private_msg': SendPrivateMsgParams
  'send_group_msg': SendGroupMsgParams
  'send_msg': SendMsgParams
  'delete_msg': DeleteMsgParams
  'get_msg': GetMsgParams
  'get_forward_msg': GetForwardMsgParams
  'send_like': SendLikeParams
  'set_group_kick': SetGroupKickParams
  'set_group_ban': SetGroupBanParams
  'set_group_anonymous_ban': SetGroupAnonymousBanParams
  'set_group_whole_ban': SetGroupWholeBanParams
  'set_group_admin': SetGroupAdminParams
  'set_group_anonymous': SetGroupAnonymousParams
  'set_group_card': SetGroupCardParams
  'set_group_name': SetGroupNameParams
  'set_group_leave': SetGroupLeaveParams
  'set_group_special_title': SetGroupSpecialTitleParams
  'set_friend_add_request': SetFriendAddRequestParams
  'set_group_add_request': SetGroupAddRequestParams
  'get_login_info': NoParams
  'get_stranger_info': GetStrangerInfoParams
  'get_friend_list': NoParams
  'get_group_info': GetGroupInfoParams
  'get_group_list': NoParams
  'get_group_member_info': GetGroupMemberInfoParams
  'get_group_member_list': GetGroupMemberListParams
  'get_group_honor_info': GetGroupHonorInfoParams
  'get_cookies': GetCookiesParams
  'get_csrf_token': NoParams
  'get_credentials': GetCredentialsParams
  'get_record': GetRecordParams
  'get_image': GetImageParams
  'can_send_image': NoParams
  'can_send_record': NoParams
  'get_status': NoParams
  'get_version_info': NoParams
  'set_restart': SetRestartParams
  'clean_cache': NoParams
}

export interface ApiRequest<T extends ApiActionName = ApiActionName> {
  action: T
  params: RequestParamsMap[T]
  echo: string
}

// 发送私聊消息
export interface SendPrivateMsgParams {
  user_id: number
  message: Message
  auto_escape?: boolean
}

// 发送群消息
export interface SendGroupMsgParams {
  group_id: number
  message: Message
  auto_escape?: boolean
}

// 发送消息
export interface SendMsgParams {
  message_type?: 'private' | 'group'
  user_id?: number
  group_id?: number
  message: Message
  auto_escape?: boolean
}

// 撤回消息
export interface DeleteMsgParams {
  message_id: number
}

// 获取消息
export interface GetMsgParams {
  message_id: number
}

// 获取合并转发消息
export interface GetForwardMsgParams {
  id: string
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

// 获取陌生人信息
export interface GetStrangerInfoParams {
  user_id: number
  no_cache?: boolean
}

// 获取群信息
export interface GetGroupInfoParams {
  group_id: number
  no_cache?: boolean
}

// 获取群成员信息
export interface GetGroupMemberInfoParams {
  group_id: number
  user_id: number
  no_cache?: boolean
}

// 获取群成员列表
export interface GetGroupMemberListParams {
  group_id: number
}

// 获取群荣誉信息
export interface GetGroupHonorInfoParams {
  group_id: number
  type: 'talkative' | 'performer' | 'legend' | 'strong_newbie' | 'emotion' | 'all'
}

// 获取 Cookies
export interface GetCookiesParams {
  domain?: string
}

// 获取 QQ 相关接口凭证
export interface GetCredentialsParams {
  domain?: string
}

// 获取语音
export interface GetRecordParams {
  file: string
  out_format: string
}

// 获取图片
export interface GetImageParams {
  file: string
}

// 重启 OneBot 实现
export interface SetRestartParams {
  delay?: number
}

// 无参数请求
type NoParams = Record<string, never>
