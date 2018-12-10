import * as crypto from 'crypto';
import {
  MESSAGE_TYPE,
  MAGIC_COOKIE,
} from './constants';

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
function createHeader(bodyLen: number): Buffer {
  // STUN Message Header is 20byte = 160bit
  const header = Buffer.alloc(20);
  // 000 - 015bit(16bit = 2byte): Message type
  header.writeUInt16BE(MESSAGE_TYPE.BINDING_REQUEST, 0);
  // 016 - 032bit(16bit = 2byte): Message length
  header.writeUInt16BE(bodyLen, 2);
  // 033 - 064bit(32bit = 4byte): Magic cookie
  header.writeUInt32BE(MAGIC_COOKIE, 4);
  // 065 - 160bit(96bit = 12byte): Transaction id
  const transactionId = crypto.randomBytes(12).toString('hex');
  header.write(transactionId, 8, 12);

  return header;
}

function createBody(): Buffer {
  // TODO
  const body = Buffer.alloc(0);
  return body;
}

export function createBindingRequest(): Buffer {
  const body = createBody();
  const header = createHeader(body.length);
  return Buffer.concat([header, body]);
}
