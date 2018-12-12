import * as crypto from 'crypto';

export interface Header {
  type: number;
  length: number;
  magicCookie: number;
  transactionId: Buffer;
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
function create(messageType: number, attrByte: number): Buffer {
  // STUN Message Header is 20byte(8+12) = 160bit
  const header = Buffer.alloc(8);

  // 000 - 015bit(16bit = 2byte): Message type
  header.writeUInt16BE(messageType, 0);
  // 016 - 032bit(16bit = 2byte): Message length
  header.writeUInt16BE(attrByte, 2);
  // 033 - 064bit(32bit = 4byte): Magic cookie
  header.writeUInt32BE(0x2112a442, 4);

  // 065 - 160bit(96bit = 12byte): Transaction id
  const transactionId = crypto.randomBytes(12);

  return Buffer.concat([header, transactionId]);
}

function parse(header: Buffer): Header {
  const type = header.readUInt16BE(0);
  const length = header.readUInt16BE(2);
  const magicCookie = header.readUInt32BE(4);
  const transactionId = header.slice(8, 20);

  return { type, length, magicCookie, transactionId };
}

export default { create, parse }
