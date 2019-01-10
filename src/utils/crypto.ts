import { randomBytes, createHmac } from 'crypto';

export function generateTransactionId(len: number): string {
  return randomBytes(len).toString('hex');
}

export function generateHmacSha1Digest(key: string, $buf: Buffer): Buffer {
  return createHmac('sha1', key)
    .update($buf)
    .digest();
}
