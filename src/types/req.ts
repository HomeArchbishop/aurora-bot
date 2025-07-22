// 定义 API 接口的类型
import type { MessageSend, NodeSegment } from './message'

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
// CQhttp 补充
| 'set_qq_profile'
| 'qidian_get_account_info'
| '_get_model_show'
| '_set_model_show'
| 'get_online_clients'
| 'get_unidirectional_friend_list'
| 'delete_unidirectional_friend'
| 'delete_friend'
| 'mark_msg_as_read'
| 'send_group_forward_msg'
| 'send_private_forward_msg'
| 'get_group_msg_history'
| 'ocr_image'
| 'set_essence_msg'
| 'delete_essence_msg'
| 'get_essence_msg_list'
| 'get_group_at_all_remain'
| 'set_group_portrait'
| 'send_group_sign'
| '_send_group_notice'
| '_get_group_notice'
| 'upload_group_file'
| 'delete_group_file'
| 'create_group_file_folder'
| 'delete_group_folder'
| 'get_group_file_system_info'
| 'get_group_root_files'
| 'get_group_files_by_folder'
| 'get_group_file_url'
| 'upload_private_file'
| 'download_file'
| 'check_url_safely'
| '.get_word_slices'
| '.handle_quick_operation'
| 'reload_event_filter'

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
  'set_qq_profile': SetQQProfileParams
  'qidian_get_account_info': QidianGetAccountInfoParams
  '_get_model_show': GetModelShowParams
  '_set_model_show': SetModelShowParams
  'get_online_clients': GetOnlineClientsParams
  'get_unidirectional_friend_list': GetUnidirectionalFriendListParams
  'delete_unidirectional_friend': DeleteUnidirectionalFriendParams
  'delete_friend': DeleteFriendParams
  'mark_msg_as_read': MarkMsgAsReadParams
  'send_group_forward_msg': SendGroupForwardMsgParams
  'send_private_forward_msg': SendPrivateForwardMsgParams
  'get_group_msg_history': GetGroupMsgHistoryParams
  'ocr_image': OcrImageParams
  'set_essence_msg': SetEssenceMsgParams
  'delete_essence_msg': DeleteEssenceMsgParams
  'get_essence_msg_list': GetEssenceMsgListParams
  'get_group_at_all_remain': GetGroupAtAllRemainParams
  'set_group_portrait': SetGroupPortraitParams
  'send_group_sign': SendGroupSignParams
  '_send_group_notice': SendGroupNoticeParams
  '_get_group_notice': GetGroupNoticeParams
  'upload_group_file': UploadGroupFileParams
  'delete_group_file': DeleteGroupFileParams
  'create_group_file_folder': CreateGroupFileFolderParams
  'delete_group_folder': DeleteGroupFolderParams
  'get_group_file_system_info': GetGroupFileSystemInfoParams
  'get_group_root_files': GetGroupRootFilesParams
  'get_group_files_by_folder': GetGroupFilesByFolderParams
  'get_group_file_url': GetGroupFileUrlParams
  'upload_private_file': UploadPrivateFileParams
  'download_file': DownloadFileParams
  'check_url_safely': CheckUrlSafelyParams
  '.get_word_slices': GetWordSlicesParams
  '.handle_quick_operation': HandleQuickOperationParams
  'reload_event_filter': ReloadEventFilterParams
}

export interface ApiRequest<T extends ApiActionName = ApiActionName> {
  action: T
  params: RequestParamsMap[T]
  echo: string
}

// 发送私聊消息
export interface SendPrivateMsgParams {
  user_id: number
  message: MessageSend
  auto_escape?: boolean
}

// 发送群消息
export interface SendGroupMsgParams {
  group_id: number
  message: MessageSend
  auto_escape?: boolean
}

// 发送消息
export interface SendMsgParams {
  message_type?: 'private' | 'group'
  user_id?: number
  group_id?: number
  message: MessageSend
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

// 设置QQ个人资料的请求参数
export interface SetQQProfileParams {
  nickname?: string
  company?: string
  email?: string
  college?: string
  personal_note?: string
}

// 获取企点账号信息的请求参数
export interface QidianGetAccountInfoParams {
  no_cache?: boolean
}

// 获取QQ空间个性卡片展示信息的请求参数
export interface GetModelShowParams {
  model: string
}

// 设置QQ空间个性卡片展示信息的请求参数
export interface SetModelShowParams {
  model: string
  model_show: boolean
}

// 获取当前账号在线客户端列表的请求参数
export interface GetOnlineClientsParams {
  no_cache?: boolean
}

// 获取单向好友列表的请求参数
export interface GetUnidirectionalFriendListParams {
  no_cache?: boolean
}

// 删除单向好友的请求参数
export interface DeleteUnidirectionalFriendParams {
  user_id: number
}

// 删除好友的请求参数
export interface DeleteFriendParams {
  user_id: number
}

// 标记消息已读
export interface MarkMsgAsReadParams {
  message_id: number
}

// 发送合并转发消息到群
export interface SendGroupForwardMsgParams {
  group_id: number
  messages: NodeSegment[]
}

// 发送合并转发消息到私聊
export interface SendPrivateForwardMsgParams {
  user_id: number
  messages: NodeSegment[]
}

// 获取群消息历史记录
export interface GetGroupMsgHistoryParams {
  message_seq?: number
  group_id: number
}

// 图片OCR识别
export interface OcrImageParams {
  image: string
}

// 设置精华消息
export interface SetEssenceMsgParams {
  message_id: number
}

// 删除精华消息
export interface DeleteEssenceMsgParams {
  message_id: number
}

// 获取精华消息列表
export interface GetEssenceMsgListParams {
  group_id: number
}

// 获取群@全体成员剩余次数
export interface GetGroupAtAllRemainParams {
  group_id: number
}

// 设置群头像
export interface SetGroupPortraitParams {
  group_id: number
  file: string
  cache?: number
}

// 群打卡
export interface SendGroupSignParams {
  group_id: number
}

// 发送群公告
export interface SendGroupNoticeParams {
  group_id: number
  content: string
  image?: string
}

// 获取群公告
export interface GetGroupNoticeParams {
  group_id: number
}

// 上传群文件
export interface UploadGroupFileParams {
  group_id: number
  file: string
  name: string
  folder?: string
}

// 删除群文件
export interface DeleteGroupFileParams {
  group_id: number
  file_id: string
  busid: number
}

// 创建群文件目录
export interface CreateGroupFileFolderParams {
  group_id: number
  name: string
  parent_id?: string
}

// 删除群文件目录
export interface DeleteGroupFolderParams {
  group_id: number
  folder_id: string
}

// 获取群文件系统信息
export interface GetGroupFileSystemInfoParams {
  group_id: number
}

// 获取群根目录文件列表
export interface GetGroupRootFilesParams {
  group_id: number
}

// 获取群子目录文件列表
export interface GetGroupFilesByFolderParams {
  group_id: number
  folder_id: string
}

// 获取群文件资源链接
export interface GetGroupFileUrlParams {
  group_id: number
  file_id: string
  busid: number
}

// 上传私聊文件
export interface UploadPrivateFileParams {
  user_id: number
  file: string
  name: string
}

// 下载文件到缓存目录
export interface DownloadFileParams {
  url: string
  thread_count?: number
  headers?: string | string[]
}

// 检查链接安全性
export interface CheckUrlSafelyParams {
  url: string
}

// 获取中文分词
export interface GetWordSlicesParams {
  content: string
}

// 处理快速操作
export interface HandleQuickOperationParams {
  context: Record<string, any>
  operation: Record<string, any>
}

// 重载事件过滤器
export interface ReloadEventFilterParams {
  file: string
}

// 无参数请求
type NoParams = Record<string, never>
