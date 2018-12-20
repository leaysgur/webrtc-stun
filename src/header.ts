import * as crypto from 'crypto';

interface HeaderJSON {
  type: number;
  length: number;
  magicCookie: number;
  transactionId: string;
}

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
    private type: number,
    private length: number = 0,
    private magicCookie: number = 0x2112a442,
    private transactionId: string = crypto.randomBytes(12).toString('hex'),
  ) {}

  getMagicCookieAsBuffer(): Buffer {
    const magicCookie = Buffer.alloc(4);
    magicCookie.writeInt32BE(this.magicCookie, 0);

    return magicCookie;
  }

  getTransactionIdAsBuffer(): Buffer {
    const transactionId = Buffer.alloc(12);
    transactionId.write(this.transactionId, 0, 12, 'hex');

    return transactionId;
  }

  toJSON(): HeaderJSON {
    return {
      type: this.type,
      length: this.length,
      magicCookie: this.magicCookie,
      transactionId: this.transactionId,
    };
  }

  toBuffer(bodyLen: number): Buffer {
    const type = Buffer.alloc(2);
    type.writeUInt16BE(this.type, 0);

    const length = Buffer.alloc(2);
    length.writeUInt16BE(bodyLen || this.length, 0);

    return Buffer.concat([
      type,
      length,
      this.getMagicCookieAsBuffer(),
      this.getTransactionIdAsBuffer(),
    ]);
  }
}
