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
    const type = buffer.readUInt16BE(0);
    const length = buffer.readUInt16BE(2);
    const magicCookie = buffer.readUInt32BE(4);
    const transactionId = buffer.slice(8, 20).toString('hex');

    return new Header(type, length, magicCookie, transactionId);
  }

  constructor(
    private _type: number,
    private _length: number = 0,
    private _magicCookie: number = 0x2112a442,
    private _transactionId: string = crypto.randomBytes(12).toString('hex'),
  ) {}

  getMagicCookieAsBuffer(): Buffer {
    const magicCookie = Buffer.alloc(4);
    magicCookie.writeInt32BE(this._magicCookie, 0);

    return magicCookie;
  }

  getTransactionIdAsBuffer(): Buffer {
    const transactionId = Buffer.alloc(12);
    transactionId.write(this._transactionId, 0, 12, 'hex');

    return transactionId;
  }

  toBuffer(bodyLen: number): Buffer {
    const type = Buffer.alloc(2);
    type.writeUInt16BE(this._type, 0);

    const length = Buffer.alloc(2);
    length.writeUInt16BE(bodyLen || this._length, 0);

    return Buffer.concat([
      type,
      length,
      this.getMagicCookieAsBuffer(),
      this.getTransactionIdAsBuffer(),
    ]);
  }
}
