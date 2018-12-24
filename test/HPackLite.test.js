/* globals describe it */
const { decodeInteger, encodeInteger, decodeHuffman, encodeHuffman, decodeStringLiteral, encodeStringLiteral, decodeHeader, encodeHeader } = require('../src/utils/index')
const { INCREMENTAL } = require('../src/constants')
const { Buffer } = require('buffer')
const { expect } = require('chai')
describe('HPackLite.utils', () => {
  describe('decodeInteger', () => {
    it('reads smallish integers', () => {
      expect(decodeInteger(Buffer.from([0x0a]), 3).value).to.equal(10)
    })
    it('reads smallish integers ignoring bits before start', () => {
      expect(decodeInteger(Buffer.from([0x8a]), 3).value).to.equal(10)
      expect(decodeInteger(Buffer.from([0xca]), 3).value).to.equal(10)
      expect(decodeInteger(Buffer.from([0xea]), 3).value).to.equal(10)
    })
    it('reads smallish integers ignoring bytes after end', () => {
      expect(decodeInteger(Buffer.from([0x0a, 0xff]), 3).value).to.equal(10)
    })
    it('reads largeish integers', () => {
      expect(decodeInteger(Buffer.from([0x1f, 0x9a, 0x0a]), 3).value).to.equal(1337)
    })
    it('reads largeish integers ignoring bits before start', () => {
      expect(decodeInteger(Buffer.from([0xff, 0x9a, 0x0a]), 3).value).to.equal(1337)
    })
    it('reads largeish integers ignoring bytes after end', () => {
      expect(decodeInteger(Buffer.from([0xff, 0x9a, 0x0a, 0xff]), 3).value).to.equal(1337)
    })
    it('throws if it runs out of buffer', () => {
      expect(() => {
        decodeInteger(Buffer.from([0xff, 0xff, 0xff]), 3)
      }).to.throw()
    })
  })
  describe('encodeInteger', () => {
    it('writes smallish integers', () => {
      expect(encodeInteger(0xe0, 3, 10)).to.deep.equal(Buffer.from([0xea]))
    })
    it('writes largeish integers', () => {
      expect(encodeInteger(0xe0, 3, 1337)).to.deep.equal(Buffer.from([0xff, 0x9a, 0x0a]))
    })
    it('writes smallish integers on octet boundaries', () => {
      expect(encodeInteger(0x0, 0, 42)).to.deep.equal(Buffer.from([0x2a]))
    })
  })
  describe('encode/decode huffman', () => {
    it('decodes strings it encodes', () => {
      const bytes = []
      for (let i = 0; i <= 0xff; i++) {
        bytes.push(i)
      }
      for (let i = 0; i < 10000; i++) {
        bytes.push(Math.floor(Math.random() * 256))
      }
      const buffer = Buffer.from(bytes)
      const encoded = encodeHuffman(buffer)
      const decoded = decodeHuffman(encoded)
      expect(decoded).to.deep.equal(buffer)
    })
  })
  describe('encode/decode StringLiteral', () => {
    it('decodes strings it encodes', () => {
      const a = Buffer.from('hello ', 'utf8')
      const encoded = encodeStringLiteral(false, a)
      const decoded = decodeStringLiteral(encoded)
      expect(a).to.deep.equal(decoded.stringLiteral)
      expect(decoded.isHuffmanEncoded).to.equal(false)
      const encodedHuffman = encodeStringLiteral(true, a)
      const decodedHuffman = decodeStringLiteral(encodedHuffman)
      expect(a).to.deep.equal(decodedHuffman.stringLiteral)
      expect(decodedHuffman.isHuffmanEncoded).to.equal(true)
    })
  })
  describe('encode/decode Header', () => {
    it('decodes strings it encodes', () => {
      const name = Buffer.from('name', 'utf8')
      const encodedName = encodeStringLiteral(false, name)
      const value = Buffer.from('value', 'utf8')
      const encodedValue = encodeStringLiteral(false, value)
      const encodedHeader = encodeHeader(INCREMENTAL, 0, encodedName, encodedValue)
      const decodedHeader = decodeHeader(encodedHeader)
      expect(decodedHeader.name.stringLiteral).to.deep.equal(name)
      expect(decodedHeader.value.stringLiteral).to.deep.equal(value)
    })
  })
})
