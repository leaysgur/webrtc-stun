import * as crypto from 'crypto';

/*
 * STUN Message Header
 *
 *  0                   1                   2                   3
 *  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |0 0|     STUN Message Type     |         Message Length        |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |                         Magic Cookie                          |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |                                                               |
 * |                     Transaction ID (96 bits)                  |
 * |                                                               |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *
 */
export class Header {
  static fromBuffer(buffer: Buffer): Header {
    const type = buffer.slice(0, 2);
    const length = buffer.slice(2, 4);
    const magicCookie = buffer.slice(4, 8);
    const transactionId = buffer.slice(8, 20);

    const header = new Header();
    header.setType(type);
    header.setLength(length);
    header.setMagicCookie(magicCookie);
    header.setTransactionId(transactionId);

    return header;
  }

  private _type: Buffer;
  private _length: Buffer;
  private _magicCookie: Buffer;
  private _transactionId: Buffer;
  constructor() {
    this._type = Buffer.alloc(2);
    this._type.writeUInt16BE(0, 0);

    this._length = Buffer.alloc(2);
    this._length.writeUInt16BE(0, 0);

    this._magicCookie = Buffer.alloc(4);
    this._magicCookie.writeUInt32BE(0x2112a442, 0);

    this._transactionId = crypto.randomBytes(12);
  }

  get magicCookie(): Buffer {
    return this._magicCookie;
  }

  get transactionId(): Buffer {
    return this._transactionId;
  }

  setType(val: number | Buffer) {
    if (Buffer.isBuffer(val)) {
      val.copy(this._type);
    } else {
      this._type.writeUInt16BE(val, 0);
    }
  }

  setLength(val: number | Buffer) {
    if (Buffer.isBuffer(val)) {
      val.copy(this._length);
    } else {
      this._length.writeUInt16BE(val, 0);
    }
  }

  setMagicCookie(val: Buffer) {
    val.copy(this._magicCookie);
  }

  setTransactionId(val: Buffer) {
    val.copy(this._transactionId);
  }

  toBuffer(): Buffer {
    return Buffer.concat([
      this._type,
      this._length,
      this._magicCookie,
      this._transactionId,
    ]);
  }
}
