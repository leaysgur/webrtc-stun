import { randomBytes, createHmac } from 'crypto';

export function generateTransactionId(): string {
  return randomBytes(12).toString('hex');
}

export function generateHmacSha1Digest(key: string, $buf: Buffer): Buffer {
  return createHmac('sha1', key)
    .update($buf)
    .digest();
}
