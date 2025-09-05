import axios, { AxiosInstance } from 'axios'
import type {
  ApiResponse, GetDetailResult, LoginParams, LoginResult, CvsUserSession,
} from './interface'

class ApiCenter {
  private static instance: ApiCenter

  private readonly axiosInstance: AxiosInstance
  private session: CvsUserSession | null = null
  private authInfo: LoginParams | null = null
  private isRefreshing = false
  private refreshPromise: Promise<void> | null = null

  constructor () {
    this.axiosInstance = axios.create({
      baseURL: 'https://cvs.bingyan.net',
    })

    this.setupInterceptors()
  }

  static getInstance (): ApiCenter {
    if (!ApiCenter.instance) {
      ApiCenter.instance = new ApiCenter()
    }
    return ApiCenter.instance
  }

  private setupInterceptors () {
    // 请求拦截器 - 自动添加token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.session?.token) {
          config.headers.Authorization = `Bearer ${this.session.token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )

    // 响应拦截器 - 处理token失效
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        // 如果是401错误且没有重试过，尝试刷新token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            await this.refreshSession()
            // 重新发送原请求
            originalRequest.headers.Authorization = `Bearer ${this.session?.token}`
            return this.axiosInstance(originalRequest)
          } catch (refreshError) {
            // 刷新失败，清除session
            this.clearSession()
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      },
    )
  }

  private async refreshSession (): Promise<void> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = this.performLogin()

    try {
      await this.refreshPromise
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  private async performLogin (): Promise<void> {
    if (!this.authInfo) {
      throw new Error('认证信息未设置')
    }

    try {
      const response = await this.axiosInstance.get<ApiResponse<LoginResult>>('api/v3/user/token', {
        params: this.authInfo,
      })

      if (response.data.success) {
        this.session = response.data.data
      } else {
        throw new Error(response.data.message || '登录失败')
      }
    } catch (error) {
      this.clearSession()
      throw error
    }
  }

  private clearSession () {
    this.session = null
  }

  private async ensureAuthenticated (): Promise<void> {
    if (!this.session && this.authInfo) {
      await this.refreshSession()
    }
  }

  setAuthInfo (username: string, password: string) {
    this.authInfo = { username, password }
  }

  async getDetail (period: string): Promise<GetDetailResult> {
    await this.ensureAuthenticated()
    const response = await this.axiosInstance.get<ApiResponse<GetDetailResult>>(
      `/api/v3/association/period/${period}/detail`)
    return response.data.data
  }
}

export default ApiCenter.getInstance()
