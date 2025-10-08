/**
 * 哈基米编码映射表
 */
const mapping = { 0: '哈', 1: '基', 2: '米' } as const

/**
 * 哈基米解码映射表
 */
const reverseMapping = { 哈: 0, 基: 1, 米: 2 } as const

/**
 * 私钥字符串
 */
const privateKey = ''

/**
 * 长度指示器类型
 */
type LengthIndicator = 0 | 1 | 2

/**
 * 支持的字符长度范围
 */
const LENGTH_RANGES = {
  0: 6,
  1: 9,
  2: 12,
} as const

/**
 * 字符到三进制字符串的转换函数
 * @param char - 要转换的字符
 * @returns 三进制字符串
 */
function charToTrinaryString (char: string): string {
  let unicodeVal = char.charCodeAt(0)
  let trinaryStr = ''
  while (unicodeVal > 0) {
    const remainder = unicodeVal % 3
    trinaryStr = remainder + trinaryStr
    unicodeVal = Math.floor(unicodeVal / 3)
  }
  return trinaryStr
}

/**
 * 将三进制的数字替换为 '哈'、'基'、'米'
 * @param trinaryStr - 三进制字符串
 * @param mapping - 映射表
 * @returns 哈基米字符串
 */
function trinaryToHajiami (trinaryStr: string, mapping: Record<string, string>): string {
  return [...trinaryStr].map(digit => mapping[digit]).join('')
}

/**
 * 将 '哈'、'基'、'米' 转换回三进制数字
 * @param hajiamiStr - 哈基米字符串
 * @param reverseMapping - 反向映射表
 * @returns 三进制字符串
 */
function hajiamiToTrinary (hajiamiStr: string, reverseMapping: Record<string, number>): string {
  return [...hajiamiStr].map(char => reverseMapping[char]).join('')
}

/**
 * 生成一个随机偏移量，用于改变加密的表现形式
 * @param i - 可选的索引参数（未使用）
 * @returns 0 到 8 的随机数
 */
function generateRandomShift (): number {
  return Math.floor(Math.random() * 9) // 生成 0 到 8 的随机数
}

/**
 * 将随机偏移量（0-9）转换为哈基米
 * @param shift - 偏移量
 * @param mapping - 映射表
 * @returns 哈基米字符串
 */
function shiftToHajiami (shift: number, mapping: Record<string, string>): string {
  const trinaryStr = shift.toString(3).padStart(2, '0')  // 转换为三进制并补足两位
  return trinaryStr.split('').map(digit => mapping[digit]).join('')
}

/**
 * 将哈基米转换回对应的偏移量（数字0-9）
 * @param hajiami - 哈基米字符串
 * @param reverseMapping - 反向映射表
 * @returns 偏移量数字
 */
function hajiamiToShift (hajiami: string, reverseMapping: Record<string, number>): number {
  const trinaryStr = hajiami.split('').map(char => reverseMapping[char]).join('')
  // 将三进制字符串转换回十进制数字
  return parseInt(trinaryStr, 3)
}

/**
 * 凯撒加密的辅助函数
 * @param unicodeVal - Unicode值
 * @param shift - 偏移量
 * @returns 加密后的Unicode值
 */
function caesarEncrypt (unicodeVal: number, shift: number): number {
  return unicodeVal + shift
}

/**
 * 凯撒解密的辅助函数
 * @param unicodeVal - Unicode值
 * @param shift - 偏移量
 * @returns 解密后的Unicode值
 */
function caesarDecrypt (unicodeVal: number, shift: number): number {
  return unicodeVal - shift
}

/**
 * 对三进制字符串右移 n 位
 * @param trinaryStr - 三进制字符串
 * @param n - 右移位数
 * @returns 右移后的字符串
 */
function rightShiftTrinary (trinaryStr: string, n: number): string {
  return trinaryStr.slice(-n) + trinaryStr.slice(0, -n)
}

/**
 * 对三进制字符串左移 n 位
 * @param trinaryStr - 三进制字符串
 * @param n - 左移位数
 * @returns 左移后的字符串
 */
function leftShiftTrinary (trinaryStr: string, n: number): string {
  return trinaryStr.slice(n) + trinaryStr.slice(0, n)
}

/**
 * 编码函数：加密字符串，并且每个字符有随机的偏移量
 * @param inputStr - 输入字符串
 * @param baseShift - 基础偏移量，默认为3
 * @param mapping - 映射表
 * @param shiftArray - 私钥偏移数组
 * @returns 编码后的哈基米字符串
 * @throws {Error} 当字符长度超过12位时抛出错误
 */
function encodeHajiami (
  inputStr: string,
  baseShift: number = 3,
  mapping: Record<string, string>,
  shiftArray: readonly number[],
): string {
  let encodedStr = ''

  for (let i = 0; i < inputStr.length; i++) {
    const char = inputStr[i]

    const randomShift = generateRandomShift() // 为每个字符生成一个随机偏移量
    const totalShift = baseShift + randomShift + (shiftArray[i] ?? 0) // 总偏移量是基础位移+随机偏移+私钥偏移
    const shiftedUnicode = caesarEncrypt(char.charCodeAt(0), totalShift) // 偏移后的 Unicode 值
    const trinaryStr = charToTrinaryString(String.fromCharCode(shiftedUnicode)) // Unicode 值转为三进制字符串
    const length = trinaryStr.length

    // 根据长度选择前缀并补齐三进制字符串
    let paddedTrinary: string
    let lengthIndicator: LengthIndicator

    if (length <= LENGTH_RANGES[0]) {
      paddedTrinary = trinaryStr.padStart(LENGTH_RANGES[0], '0')
      lengthIndicator = 0 // 长度标识：0 表示 6 位
    } else if (length <= LENGTH_RANGES[1]) {
      paddedTrinary = trinaryStr.padStart(LENGTH_RANGES[1], '0')
      lengthIndicator = 1 // 长度标识：1 表示 9 位
    } else if (length <= LENGTH_RANGES[2]) {
      paddedTrinary = trinaryStr.padStart(LENGTH_RANGES[2], '0')
      lengthIndicator = 2 // 长度标识：2 表示 12 位
    } else {
      throw new Error('你说的真的是正常的人类的语言吗🤯')
    }

    // 随机化长度标识
    lengthIndicator = ((lengthIndicator + randomShift) % 3) as LengthIndicator
    // 右移操作：根据 randomShift 确定右移位数
    const shiftedTrinary = rightShiftTrinary(paddedTrinary, randomShift)

    // 生成 2位凯撒移位编码 + 1位长度标识 + 三进制密文
    const shiftAsHajiami = shiftToHajiami(randomShift, mapping) // 将随机偏移量转为 "哈基米" 的形式
    const lengthAsHajiami = mapping[lengthIndicator] // 长度标识转为 "哈基米" 的形式
    const inputAsHajiami = trinaryToHajiami(shiftedTrinary, mapping) // 三进制密文转为 "哈基米" 的形式
    encodedStr += shiftAsHajiami + lengthAsHajiami + inputAsHajiami // 2位移位编码 + 1位长度标识 + 三进制密文
  }

  return encodedStr
}

/**
 * 解码函数：根据加密时的随机偏移量正确解密字符
 * @param encodedStr - 编码后的哈基米字符串
 * @param baseShift - 基础偏移量，默认为3
 * @param reverseMapping - 反向映射表
 * @param shiftArray - 私钥偏移数组
 * @returns 解码后的原始字符串
 * @throws {Error} 当密文格式不符合要求时抛出错误
 */
function decodeHajiami (
  encodedStr: string,
  baseShift: number = 3,
  reverseMapping: Record<string, number>,
  shiftArray: readonly number[],
): string {
  let decodedStr = ''

  for (let i = 0, j = 0; i < encodedStr.length; j++) {
    // 获取2位凯撒移位编码
    const shiftAsHajiami = encodedStr.slice(i, i + 2) // 读取两位作为偏移量
    const randomShift = hajiamiToShift(shiftAsHajiami, reverseMapping) // 转换回数字
    i += 2

    // 获取长度标识
    const lengthAsHajiami = encodedStr[i]
    let lengthIndicator = reverseMapping[lengthAsHajiami]
    lengthIndicator = (lengthIndicator - randomShift + 9) % 3 // 还原长度标识
    i += 1 // 长度标识占一位

    let length: number
    if (lengthIndicator === 0) {
      length = LENGTH_RANGES[0]
    } else if (lengthIndicator === 1) {
      length = LENGTH_RANGES[1]
    } else if (lengthIndicator === 2) {
      length = LENGTH_RANGES[2]
    } else {
      throw new Error('不符合编码格式的密文')
    }

    // 获取密文部分
    const inputAsHajiami = encodedStr.slice(i, i + length)
    i += length

    // 提取 reverse_mapping 的键
    const keys = Object.keys(reverseMapping)
    // 创建动态正则表达式，匹配 keys 中的字符
    const regex = new RegExp(`^[${keys.join('')}]+$`)

    if (!regex.test(inputAsHajiami)) {
      throw new Error('不符合编码格式的密文')
    }

    // 左移操作：根据 randomShift 确定左移位数
    const originalTrinary = leftShiftTrinary(hajiamiToTrinary(inputAsHajiami, reverseMapping), randomShift)
    // 三进制转为十进制unicode
    const unicodeVal = parseInt(originalTrinary, 3)

    // 根据加密时的凯撒偏移量还原字符
    const totalShift = shiftArray.length > 0
      ? baseShift + randomShift + shiftArray[j]
      : baseShift + randomShift // 总偏移量是基础位移加上随机偏移
    const originalUnicode = caesarDecrypt(unicodeVal, totalShift)
    decodedStr += String.fromCharCode(originalUnicode)
  }

  return decodedStr
}

/**
 * 用于生成私钥移位量并扩展到目标长度
 * @param privateKey - 私钥字符串
 * @param encryptLength - 加密长度
 * @returns 扩展后的偏移量数组
 */
function generateShiftArrayFromPrivateKey (privateKey: string, encryptLength: number): readonly number[] {
  if (!privateKey) {
    return []
  }

  // 将私钥转换为偏移量数组，使用现代JavaScript特性优化
  const shiftArray = Array.from(privateKey, char =>
    Array.from(char.charCodeAt(0).toString(), Number),
  ).flat()

  // 使用Array.from和模运算优化扩展逻辑
  return Array.from({ length: encryptLength }, (_, i) =>
    shiftArray[i % shiftArray.length],
  )
}

/**
 * 加密文本
 * @param inputText - 要加密的文本
 * @returns 加密后的哈基米字符串
 */
export function encryptText (inputText: string): string {
  const shiftArray = generateShiftArrayFromPrivateKey(privateKey, inputText.length) // 根据私钥生成移位数组
  const encodedText = encodeHajiami(inputText, 3, mapping, shiftArray) // 加密
  return encodedText
}

/**
 * 解密文本
 * @param inputText - 要解密的哈基米字符串
 * @returns 解密后的原始文本
 */
export function decryptText (inputText: string): string {
  const shiftArray = generateShiftArrayFromPrivateKey(privateKey, inputText.length) // 根据私钥生成移位数组
  const decodedText = decodeHajiami(inputText, 3, reverseMapping, shiftArray) // 解密
  return decodedText
}
