enum KeyStatus {
  OK = 'ok',
  BAD = 'bad',
  UNKNOWN = 'unknown',
}

export interface KeyObject {
  keyIndex: number
  key: string
  status: KeyStatus
}

export class KeyPool {
  #pool: KeyObject[]

  constructor (keys: string[]) {
    this.#pool = keys.map((key, index) => ({
      keyIndex: index,
      key,
      status: KeyStatus.UNKNOWN,
    }))
  }

  markValid (keyIndex: number): void {
    this.#pool[keyIndex].status = KeyStatus.OK
  }

  markInvalid (keyIndex: number): void {
    this.#pool[keyIndex].status = KeyStatus.BAD
  }

  getValidKeys () {
    return this.#pool.filter(item => item.status !== KeyStatus.BAD)
  }

  getKeyStatuses () {
    return this.#pool
  }
}
