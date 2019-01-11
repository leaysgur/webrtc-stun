import { randomBytes, createHmac } from 'crypto';
import * as crc32 from 'buffer-crc32';
import { bufferXor } from './buffer';

export function generateTransactionId(len: number): string {
  return randomBytes(len).toString('hex');
}

export function generateHmacSha1Digest(key: string, $buf: Buffer): Buffer {
  return createHmac('sha1', key)
    .update($buf)
    .digest();
}

export function generateFingerprint($msg: Buffer): Buffer {
  // without FINGERPRINT: 8byte(header: 4byte + value: 4byte(32bit))
  const $crc32 = crc32($msg.slice(0, -8));
  return bufferXor($crc32, Buffer.from('5354554e', 'hex'));
}

export function generateIntegrity($msg: Buffer, integrityKey: string): Buffer {
  // without MESSAGE-INTEGRITY(header: 4byte + value: 20byte(sha1))
  return generateHmacSha1Digest(integrityKey, $msg.slice(0, -24));
}

export function generateIntegrityWithFingerprint(
  $msg: Buffer,
  integrityKey: string,
): Buffer {
  // modify header length to ignore FINGERPRINT(8byte)
  const msgLen = $msg.readUInt16BE(2);
  $msg.writeUInt16BE(msgLen - 8, 2);

  // without 32byte MESSAGE-INTEGRITY(24byte)
  // + FINGERPRINT: 8byte = (header: 4byte + value: 4byte)
  return generateHmacSha1Digest(integrityKey, $msg.slice(0, -32));
}
