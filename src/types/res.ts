// 定义 API 接口的类型
import type { MessageReceive } from './message'
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
  'set_qq_profile': null
  'qidian_get_account_info': QidianGetAccountInfoResponseData
  '_get_model_show': GetModelShowResponseData
  '_set_model_show': null
  'get_online_clients': GetOnlineClientsResponseData
  'get_unidirectional_friend_list': GetUnidirectionalFriendListResponseData
  'delete_unidirectional_friend': null
  'delete_friend': DeleteFriendResponseData
  'mark_msg_as_read': MarkMsgAsReadResponseData
  'send_group_forward_msg': SendGroupForwardMsgResponseData
  'send_private_forward_msg': SendPrivateForwardMsgResponseData
  'get_group_msg_history': GetGroupMsgHistoryResponseData
  'ocr_image': OcrImageResponseData
  'set_essence_msg': null
  'delete_essence_msg': null
  'get_essence_msg_list': GetEssenceMsgListResponseData
  'get_group_at_all_remain': GetGroupAtAllRemainResponseData
  'set_group_portrait': SetGroupPortraitResponseData
  'send_group_sign': SendGroupSignResponseData
  '_send_group_notice': null
  '_get_group_notice': GetGroupNoticeResponseData
  'upload_group_file': UploadGroupFileResponseData
  'delete_group_file': DeleteGroupFileResponseData
  'create_group_file_folder': CreateGroupFileFolderResponseData
  'delete_group_folder': DeleteGroupFolderResponseData
  'get_group_file_system_info': GetGroupFileSystemInfoResponseData
  'get_group_root_files': GetGroupRootFilesResponseData
  'get_group_files_by_folder': GetGroupFilesByFolderResponseData
  'get_group_file_url': GetGroupFileUrlResponseData
  'upload_private_file': UploadPrivateFileResponseData
  'download_file': DownloadFileResponseData
  'check_url_safely': CheckUrlSafelyResponseData
  '.get_word_slices': GetWordSlicesResponseData
  '.handle_quick_operation': null
  'reload_event_filter': null
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
  message: MessageReceive
}

// 获取合并转发消息
export interface GetForwardMsgResponseData {
  message: Array<{
    content: string
    sender: {
      nickname: string
      user_id: number
    }
    time: number
  }>
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

// 获取企点账号信息的响应数据
export interface QidianGetAccountInfoResponseData {
  master_id: number
  ext_name: string
  create_time: number
}

// 获取QQ空间个性卡片展示信息的响应数据
export interface GetModelShowResponseData {
  variants: {
    model_show: boolean
    need_pay: boolean
  }
}

// 获取当前账号在线客户端列表的响应数据
export interface GetOnlineClientsResponseData {
  clients: Array<{
    app_id: number
    device_name: string
    device_kind: string
  }>
}

// 获取单向好友列表的响应数据
export interface GetUnidirectionalFriendListResponseData {
  friends: Array<{
    user_id: number
    nickname: string
    source: string
  }>
}

// 删除好友的响应数据
export interface DeleteFriendResponseData {
  user_id: number
}

// 标记消息已读的响应数据
export interface MarkMsgAsReadResponseData {
  message_id: number
}

// 发送合并转发消息到群的响应数据
export interface SendGroupForwardMsgResponseData {
  message_id: number
  forward_id: string
}

// 发送合并转发消息到私聊的响应数据
export interface SendPrivateForwardMsgResponseData {
  message_id: number
  forward_id: string
}

// 获取群消息历史记录的响应数据
export interface GetGroupMsgHistoryResponseData {
  messages: MessageReceive[]
}

// 图片OCR识别的响应数据
export interface OcrImageResponseData {
  texts: Array<{
    text: string
    confidence: number
    coordinates: number[][]
  }>
  language: string
}

// 获取精华消息列表的响应数据
export interface GetEssenceMsgListResponseData {
  essences: Array<{
    sender_id: number
    sender_nick: string
    sender_time: number
    operator_id: number
    operator_nick: string
    operator_time: number
    message_id: number
    content: string
  }>
}

// 获取群@全体成员剩余次数的响应数据
export interface GetGroupAtAllRemainResponseData {
  can_at_all: boolean
  remain_at_all_count_for_group: number
  remain_at_all_count_for_uin: number
}

// 设置群头像的响应数据
export interface SetGroupPortraitResponseData {
  group_id: number
}

// 群打卡的响应数据
export interface SendGroupSignResponseData {
  group_id: number
}

// 获取群公告的响应数据
export interface GetGroupNoticeResponseData {
  notices: Array<{
    sender_id: number
    publish_time: number
    message: {
      text: string
      images: Array<{
        height: string
        width: string
        id: string
      }>
    }
  }>
}

// 上传群文件的响应数据
export interface UploadGroupFileResponseData {
  file_id: string
  busid: number
}

// 删除群文件的响应数据
export interface DeleteGroupFileResponseData {
  group_id: number
  file_id: string
  busid: number
}

// 创建群文件目录的响应数据
export interface CreateGroupFileFolderResponseData {
  folder_id: string
}

// 删除群文件目录的响应数据
export interface DeleteGroupFolderResponseData {
  group_id: number
  folder_id: string
}

// 获取群文件系统信息的响应数据
export interface GetGroupFileSystemInfoResponseData {
  file_count: number
  limit_count: number
  used_space: number
  total_space: number
}

// 获取群根目录文件列表的响应数据
export interface GetGroupRootFilesResponseData {
  files: Array<{
    file_id: string
    file_name: string
    busid: number
    file_size: number
    upload_time: number
    dead_time: number
    modify_time: number
    download_times: number
    uploader: number
    uploader_name: string
  }>
  folders: Array<{
    folder_id: string
    folder_name: string
    create_time: number
    creator: number
    creator_name: string
    total_file_count: number
  }>
}

// 获取群子目录文件列表的响应数据
export interface GetGroupFilesByFolderResponseData {
  files: Array<{
    file_id: string
    file_name: string
    busid: number
    file_size: number
    upload_time: number
    dead_time: number
    modify_time: number
    download_times: number
    uploader: number
    uploader_name: string
  }>
  folders: Array<{
    folder_id: string
    folder_name: string
    create_time: number
    creator: number
    creator_name: string
    total_file_count: number
  }>
}

// 获取群文件资源链接的响应数据
export interface GetGroupFileUrlResponseData {
  url: string
}

// 上传私聊文件的响应数据
export interface UploadPrivateFileResponseData {
  file_id: string
  url: string
}

// 下载文件到缓存目录的响应数据
export interface DownloadFileResponseData {
  file: string
}

// 检查链接安全性的响应数据
export interface CheckUrlSafelyResponseData {
  level: number
}

// 获取中文分词的响应数据
export interface GetWordSlicesResponseData {
  slices: string[]
}
