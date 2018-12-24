const { Buffer } = require('buffer')
const { decodeInteger, encodeInteger } = require('./integer')

function decodeStringLiteral (buffer, byteOffset = 0) {
  const decodedLength = decodeInteger(buffer, 1, byteOffset)
  byteOffset = decodedLength.byteOffset + decodedLength.value
  return {
    isHuffmanEncoded: Boolean(decodedLength.firstByte),
    stringLiteral: buffer.slice(decodedLength.byteOffset, byteOffset),
    byteOffset
  }
}
function encodeStringLiteral (isHuffmanEncoded, stringLiteral) {
  const byte = isHuffmanEncoded ? 0x80 : 0x00
  return Buffer.concat([encodeInteger(byte, 1, stringLiteral.length), stringLiteral])
}

exports.decodeStringLiteral = decodeStringLiteral
exports.encodeStringLiteral = encodeStringLiteral
