const { decodeInteger, encodeInteger } = require('./codecs/integer')
const { decodeHuffman, encodeHuffman } = require('./codecs/huffman')
const { decodeStringLiteral, encodeStringLiteral } = require('./codecs/stringLiteral')
const { decodeHeader, encodeHeader } = require('./codecs/header')

exports.decodeInteger = decodeInteger
exports.encodeInteger = encodeInteger
exports.decodeHuffman = decodeHuffman
exports.encodeHuffman = encodeHuffman
exports.decodeStringLiteral = decodeStringLiteral
exports.encodeStringLiteral = encodeStringLiteral
exports.decodeHeader = decodeHeader
exports.encodeHeader = encodeHeader
