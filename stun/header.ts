import * as crypto from 'crypto';

/*
 * - STUN Message
 *   - ヘッダ（20byte）
 *   - ボディ（0~Nbyte: 任意の数のAttrbutes）
 *
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
export function createHeader(messageType: number, attrByte: number): Buffer {
  // STUN Message Header is 20byte = 160bit
  const header = Buffer.alloc(20);
  // 000 - 015bit(16bit = 2byte): Message type
  header.writeUInt16BE(messageType, 0);
  // 016 - 032bit(16bit = 2byte): Message length
  header.writeUInt16BE(attrByte, 2);
  // 033 - 064bit(32bit = 4byte): Magic cookie
  header.writeUInt32BE(0x2112a442, 4);
  // 065 - 160bit(96bit = 12byte): Transaction id
  const transactionId = crypto.randomBytes(12).toString('hex');
  header.write(transactionId, 8, 12);

  return header;
}