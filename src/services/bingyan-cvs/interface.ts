export interface CvsUserSession {
  token: string
  nickname: string
  association: string
  identity: string
}

export interface CvsDetail {
  group_id: number
  group_name: string
  signup_count: number
  now_count: number
}

/**
 * API 接口
 */

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  nickname: string
  association: string
  identity: string
}

export interface GetDetailResult {
  id: number
  name: string
  create_time: number
  current: boolean
  now_count: number
  signup_count: number
  detail: CvsDetail[]
}
