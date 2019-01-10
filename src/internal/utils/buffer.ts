export function bufferXor(a: Buffer, b: Buffer): Buffer {
  // a and b should have same length
  const length = a.length;
  const buffer = Buffer.allocUnsafe(length);

  for (let i = 0; i < length; i++) {
    buffer[i] = a[i] ^ b[i];
  }

  return buffer;
}
