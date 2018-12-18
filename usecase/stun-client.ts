import * as dgram from 'dgram';
import {
  createStunBindingRequest,
  isStunMessage,
  parseStunMessage,
  STUN_MESSAGE_TYPE,
  STUN_ATTRIBUTE_TYPE,
} from '../stun';

// TODO: move this somewhere
/**
 * STUN XOR_MAPPED_ADDRESS Attribute
 *
 *  0                   1                   2                   3
 *  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |x x x x x x x x|    Family     |         X-Port                |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |                X-Address (Variable)
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *
 */
interface XorMappedAddress {
  family: number;
  port: number;
  address: string;
}
function parseXorMappedAddress(buf: Buffer, header: Buffer): XorMappedAddress {
  const family = {
    [`${0x01}`]: 4,
    [`${0x02}`]: 6,
  }[buf.readUInt16BE(0)];

  const port = parsePort(buf, header);
  const address = family === 4 ? parseIpV4(buf, header) : parseIpV6(buf, header);

  return { family, port, address };
}

function parsePort(attrBuf: Buffer, headBuf: Buffer): number {
  const xport = attrBuf.slice(2, 4);
  const mc = headBuf.slice(4, 8);

  const xored = bufferXor(xport, mc.slice(0, 2));
  return xored.readUInt16LE(0);
}
function parseIpV4(attrBuf: Buffer, headBuf: Buffer): string {
  const xaddress = attrBuf.slice(4, 8);
  const mc = headBuf.slice(4, 8);

  const xored = bufferXor(xaddress, mc);
  return ipV4BufferToString(xored);
}
function parseIpV6(attrBuf: Buffer, headBuf: Buffer): string {
  const xaddress = attrBuf.slice(4, 20);
  const mc = headBuf.slice(4, 8);
  const tid = headBuf.slice(8, 20);

  const xored = bufferXor(xaddress, Buffer.concat([mc, tid]));
  return ipV6BufferToString(xored);
}

function bufferXor(a: Buffer, b: Buffer): Buffer {
  const length = Math.max(a.length, b.length);
  const buffer = Buffer.allocUnsafe(length);

  for (let i = 0; i < length; ++i) {
    buffer[i] = a[i] ^ b[i];
  }

  return buffer;
}
function ipV4BufferToString(buf: Buffer): string {
  const ipV4Arr = [];
  for (const digit of buf) {
    ipV4Arr.push(digit);
  }
  return ipV4Arr.join('.');
}
function ipV6BufferToString(buf: Buffer): string {
  // TODO: impl
  const ipV4Arr = [];
  for (const digit of buf) {
    ipV4Arr.push(digit);
  }
  return ipV4Arr.join(':');
}

const socket = dgram.createSocket({ type: 'udp4' });
socket.on('message', (msg: Buffer) => {
  if (!isStunMessage(msg)) {
    console.log('not a stun packet', msg.toString('hex'));
    socket.close();
    return;
  }

  console.log('recv');
  console.log(msg.slice(20, msg.length));
  const { header, attrs } = parseStunMessage(msg);
  console.log(attrs.keys());
  console.log('SOFTWARE ?', attrs.has(STUN_ATTRIBUTE_TYPE.SOFTWARE));
  console.log('XOR_MAPPED_ADDRESS', attrs.has(STUN_ATTRIBUTE_TYPE.XOR_MAPPED_ADDRESS));
  console.log(parseXorMappedAddress(attrs.get(STUN_ATTRIBUTE_TYPE.XOR_MAPPED_ADDRESS)!.value, msg.slice(0, 20)));
  // console.log(parseXorMappedAddress(attrs.get(STUN_ATTRIBUTE_TYPE.XOR_MAPPED_ADDRESS)!.value, header.magicCookie));

  switch (header.type) {
    case STUN_MESSAGE_TYPE.BINDING_RESPONSE_SUCCESS:
      console.log('BINDING_RESPONSE_SUCCESS');
      break;
    case STUN_MESSAGE_TYPE.BINDING_RESPONSE_ERROR:
      console.log('BINDING_RESPONSE_ERROR');
      break;
  }

  socket.close();
});

const packet = createStunBindingRequest('webrtc-stack-study');
// console.log('send');
// console.log(packet.toString('hex'));
socket.bind(55555);
// socket.send(packet, 3478, 'stun.webrtc.ecl.ntt.com');
socket.send(packet, 19302, 'stun.l.google.com');
