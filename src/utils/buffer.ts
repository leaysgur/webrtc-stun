export function bufferXor(a: Buffer, b: Buffer): Buffer {
  if (a.length !== b.length) {
    throw new TypeError(
      '[webrtc-stun] You can not XOR buffers which length are different',
    );
  }

  const length = a.length;
  const buffer = Buffer.allocUnsafe(length);

  for (let i = 0; i < length; i++) {
    buffer[i] = a[i] ^ b[i];
  }

  return buffer;
}
