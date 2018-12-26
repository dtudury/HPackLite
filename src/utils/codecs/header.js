const { INDEXED, INCREMENTAL, NOT_INDEXED, NEVER_INDEXED, SIZE_UPDATE } = require('../../constants')
const { decodeInteger, encodeInteger } = require('./integer')
const { decodeStringLiteral } = require('./stringLiteral')

function decodeHeader (buffer, byteOffset = 0) {
  const firstByte = buffer.readUInt8(byteOffset)
  let kind
  let decodedIndex
  if (firstByte & NEVER_INDEXED) {
    decodedIndex = decodeInteger(buffer, 4, byteOffset)
    kind = NEVER_INDEXED
  } else if (firstByte & SIZE_UPDATE) {
    decodedIndex = decodeInteger(buffer, 3, byteOffset)
    kind = SIZE_UPDATE
  } else if (firstByte & INCREMENTAL) {
    decodedIndex = decodeInteger(buffer, 2, byteOffset)
    kind = INCREMENTAL
  } else if (firstByte & INDEXED) {
    decodedIndex = decodeInteger(buffer, 1, byteOffset)
    kind = INDEXED
  } else {
    decodedIndex = decodeInteger(buffer, 4, byteOffset)
    kind = NOT_INDEXED
  }
  byteOffset = decodedIndex.byteOffset
  if (kind === INDEXED) {
    return { kind: INDEXED, index: decodedIndex.value, byteOffset }
  } else if (kind === SIZE_UPDATE) {
    return { kind: SIZE_UPDATE, maxSize: decodedIndex.value, byteOffset }
  }
  let name
  if (!decodedIndex.value) {
    name = decodeStringLiteral(buffer, byteOffset)
    byteOffset = name.byteOffset
  }
  const value = decodeStringLiteral(buffer, byteOffset)
  byteOffset = value.byteOffset
  return { kind, index: decodedIndex.value, name, value, byteOffset }
}
function encodeHeader (kind, index, name, value) {
  if (index) {
    // index holds (indexed) name. name holds value
    value = Buffer.from([])
  }
  if (kind === INDEXED) {
    return encodeInteger(INDEXED, 1, index)
  } else if (kind === INCREMENTAL) {
    return Buffer.concat([encodeInteger(INCREMENTAL, 2, index), name, value])
  } else if (kind === SIZE_UPDATE) {
    return encodeInteger(SIZE_UPDATE, 3, index)
  } else if (kind === NEVER_INDEXED) {
    return Buffer.concat([encodeInteger(NEVER_INDEXED, 4, index), name, value])
  } else if (kind === NOT_INDEXED) {
    return Buffer.concat([encodeInteger(NOT_INDEXED, 4, index), name, value])
  } else {
    throw new Error(`unknown header kind: ${kind}`)
  }
}

exports.decodeHeader = decodeHeader
exports.encodeHeader = encodeHeader
