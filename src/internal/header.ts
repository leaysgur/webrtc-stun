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
  constructor(
    private _type: number = 0,
    private _length: number = 0,
    private _magicCookie: number = 0x2112a442,
    private _transactionId: string = crypto.randomBytes(12).toString('hex'),
  ) {}

  get type(): number {
    return this._type;
  }
  // TODO: いる？constructor()でいいのでは？
  set type(type: number) {
    this._type = type;
  }

  getMagicCookieAsBuffer(): Buffer {
    const $magicCookie = Buffer.alloc(4);
    $magicCookie.writeInt32BE(this._magicCookie, 0);

    return $magicCookie;
  }

  getTransactionIdAsBuffer(): Buffer {
    const $transactionId = Buffer.alloc(12);
    $transactionId.write(this._transactionId, 0, 12, 'hex');

    return $transactionId;
  }

  toBuffer(bodyLen: number): Buffer {
    const $type = Buffer.alloc(2);
    $type.writeUInt16BE(this._type, 0);

    const $length = Buffer.alloc(2);
    $length.writeUInt16BE(bodyLen || this._length, 0);

    return Buffer.concat([
      $type,
      $length,
      this.getMagicCookieAsBuffer(),
      this.getTransactionIdAsBuffer(),
    ]);
  }

  loadBuffer($header: Buffer): boolean {
    this._type = $header.readUInt16BE(0);
    this._length = $header.readUInt16BE(2);
    this._magicCookie = $header.readUInt32BE(4);
    this._transactionId = $header.slice(8, 20).toString('hex');

    // TODO: check type(cls, mtd)

    if (this._magicCookie !== 0x2112a442) {
      return false;
    }

    return true;
  }
}
