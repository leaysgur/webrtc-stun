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
  static fromBuffer($header: Buffer): Header {
    const type = $header.readUInt16BE(0);
    const length = $header.readUInt16BE(2);
    const magicCookie = $header.readUInt32BE(4);
    const transactionId = $header.slice(8, 20).toString('hex');

    return new Header(type, length, magicCookie, transactionId);
  }

  constructor(
    public type: number,
    public length: number = 0,
    public magicCookie: number = 0x2112a442,
    public transactionId: string = crypto.randomBytes(12).toString('hex'),
  ) {}

  setTransactionId(transactionId: string) {
    this.transactionId = transactionId;
  }

  getMagicCookieAsBuffer(): Buffer {
    const $magicCookie = Buffer.alloc(4);
    $magicCookie.writeInt32BE(this.magicCookie, 0);

    return $magicCookie;
  }

  getTransactionIdAsBuffer(): Buffer {
    const $transactionId = Buffer.alloc(12);
    $transactionId.write(this.transactionId, 0, 12, 'hex');

    return $transactionId;
  }

  toBuffer(bodyLen: number): Buffer {
    const $type = Buffer.alloc(2);
    $type.writeUInt16BE(this.type, 0);

    const $length = Buffer.alloc(2);
    $length.writeUInt16BE(bodyLen || this.length, 0);

    return Buffer.concat([
      $type,
      $length,
      this.getMagicCookieAsBuffer(),
      this.getTransactionIdAsBuffer(),
    ]);
  }
}
