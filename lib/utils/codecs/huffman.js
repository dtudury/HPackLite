const { Buffer } = require('buffer')
const { huffmanCodes } = require('../../constants')

const huffmanTree = []
huffmanCodes.forEach(([int, length], i) => {
  let mask = 1 << (length - 1)
  let branch = huffmanTree
  while (mask) {
    let fork = mask & int ? 1 : 0
    branch[fork] = branch[fork] || []
    if (mask !== 1) {
      branch = branch[fork]
    } else {
      branch[fork] = i
    }
    mask >>>= 1
  }
})

function _getByte (code, length, offset) {
  const rightShiftBy = length - offset - 8
  if (rightShiftBy >= 0) {
    return code >>> rightShiftBy
  } else {
    return code << -rightShiftBy
  }
}

function decodeHuffman (buffer) {
  const bytes = []
  let branch = huffmanTree
  for (const byte of buffer) {
    for (let mask = 0x80; mask; mask >>>= 1) {
      branch = branch[Math.min(1, mask & byte)]
      if (!Array.isArray(branch)) {
        bytes.push(branch)
        branch = huffmanTree
      }
    }
  }
  return Buffer.from(bytes)
}
function encodeHuffman (stringLiteral) {
  const codes = []
  let totalLength = 0
  for (const byte of stringLiteral) {
    let [code, length] = huffmanCodes[byte]
    const startByte = totalLength >>> 3
    const startBit = totalLength % 8
    codes.push({ code, length, startByte, startBit })
    totalLength += length
  }
  const buffer = Buffer.alloc(Math.ceil(totalLength / 8))
  let remainder = 0
  codes.forEach(({ code, length, startByte, startBit }, index) => {
    let offset = -startBit
    while (offset <= length - 8) {
      let byte = _getByte(code, length, offset) | remainder
      buffer.writeUInt8(byte & 0xff, startByte++)
      remainder = 0
      offset += 8
    }
    remainder |= _getByte(code, length, offset)
  })
  if (totalLength % 8) {
    buffer.writeUInt8(remainder & 0xff | 0xff >>> totalLength % 8, buffer.length - 1)
  }
  return buffer
}

exports.decodeHuffman = decodeHuffman
exports.encodeHuffman = encodeHuffman
