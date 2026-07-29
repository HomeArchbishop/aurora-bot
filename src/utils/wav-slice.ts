/**
 * 动态查找 WAV 中 data chunk 的起始偏移
 * @param {Buffer} wavBuffer
 * @returns {{ dataOffset: number, dataSize: number }}
 */
function findDataChunk (wavBuffer: Buffer): { dataOffset: number, dataSize: number } {
  let offset = 12 // 跳过 'RIFF' + fileSize + 'WAVE'

  while (offset < wavBuffer.length - 8) {
    const chunkId = wavBuffer.toString('ascii', offset, offset + 4)
    const chunkSize = wavBuffer.readUInt32LE(offset + 4)

    if (chunkId === 'data') {
      return {
        dataOffset: offset + 8,  // data chunk 头 8 字节后才是 PCM
        dataSize: chunkSize,
      }
    }

    offset += 8 + chunkSize
    // chunk size 需要对齐到偶数
    if (chunkSize % 2 !== 0) offset += 1
  }

  throw new Error('找不到 data chunk，不是合法的 WAV 文件')
}

/**
 * 切除 WAV buffer 末尾的 x 毫秒
 * @param {Buffer} wavBuffer
 * @param {number} trimMs
 * @returns {Buffer}
 */
export function trimWavEnd (wavBuffer: Buffer, trimMs: number): Buffer {
  const sampleRate = wavBuffer.readUInt32LE(24)
  const numChannels = wavBuffer.readUInt16LE(22)
  const bitDepth = wavBuffer.readUInt16LE(34)

  const bytesPerSample = (bitDepth / 8) * numChannels
  const bytesPerSecond = sampleRate * bytesPerSample
  const trimBytes = Math.floor((trimMs / 1000) * bytesPerSecond)

  // 动态找 data chunk
  const { dataOffset, dataSize } = findDataChunk(wavBuffer)

  const newDataSize = dataSize - trimBytes
  if (newDataSize <= 0) {
    throw new Error(`trimMs (${trimMs}ms) 超过了音频总时长`)
  }

  // 直接复制原始头部（保留所有 chunk），只截断 PCM 数据
  const headerPart = wavBuffer.slice(0, dataOffset)
  const pcmSlice = wavBuffer.slice(dataOffset, dataOffset + newDataSize)

  const out = Buffer.alloc(headerPart.length + pcmSlice.length)
  headerPart.copy(out, 0)
  pcmSlice.copy(out, headerPart.length)

  // 修正 data chunk size
  const dataChunkSizeOffset = dataOffset - 4
  out.writeUInt32LE(newDataSize, dataChunkSizeOffset)

  // 修正 RIFF 总大小
  out.writeUInt32LE(out.length - 8, 4)

  return out
}
