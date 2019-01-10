export function ipV4BufferToString($ip: Buffer): string {
  const res = [];
  for (const digit of $ip) {
    res.push(digit.toString());
  }
  return res.join('.');
}
export function ipV4StringToBuffer(ip: string): Buffer {
  const res = Buffer.alloc(4);
  let idx = 0;
  for (const digit of ip.split('.')) {
    res[idx] = parseInt(digit, 10);
    idx++;
  }
  return res;
}

export function ipV6BufferToString($ip: Buffer): string {
  const res = [];
  for (let i = 0; i < $ip.length; i += 2) {
    res.push($ip.readUInt16BE(i).toString(16));
  }
  return res
    .join(':')
    .replace(/(^|:)0(:0)*:0(:|$)/, '$1::$3')
    .replace(/:{3,4}/, '::');
}
export function ipV6StringToBuffer(ip: string): Buffer {
  // TODO: impl
  return Buffer.from(ip);
}
