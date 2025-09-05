import apiCenter from './api'
import type { CvsDetail } from './interface'

class Cvs {
  private static instance: Cvs

  constructor () {
    Cvs.instance = this
  }

  static getInstance (): Cvs {
    if (!Cvs.instance) {
      Cvs.instance = new Cvs()
    }
    return Cvs.instance
  }

  async setAuthInfo (username: string, password: string): Promise<void> {
    apiCenter.setAuthInfo(username, password)
  }

  async getDetail (period: string): Promise<CvsDetail[]> {
    const { detail } = await apiCenter.getDetail(period)
    return detail
  }
}

export {
  Cvs,
}
