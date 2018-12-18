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
  const familyVal = buf.readUInt16BE(0);
  const family = {
    [`${0x01}`]: 4,
    [`${0x02}`]: 6,
  }[familyVal];

  const port = parsePort(buf, header);

  const address = {
    [`${0x01}`]: parseIpV4(buf, header),
    [`${0x02}`]: parseIpV6(buf, header),
  }[familyVal];

  return { family, port, address };
}

function parsePort(attr: Buffer, header: Buffer): number {
  const xport = attr.slice(2, 4);
  const mc = header.slice(4, 6);

  const xored = bufferXor(xport, mc);
  return xored.readUInt16BE(0);
}
function parseIpV4(attr: Buffer, header: Buffer): string {
  const xaddress = attr.slice(4, 8);
  const mc = header.slice(4, 8);

  const xored = bufferXor(xaddress, mc);
  return ipV4BufferToString(xored);
}
function parseIpV6(attr: Buffer, header: Buffer): string {
  const xaddress = attr.slice(4, 20);
  const mc = header.slice(4, 8);
  const tid = header.slice(8, 20);

  const xored = bufferXor(xaddress, Buffer.concat([mc, tid]));
  return ipV6BufferToString(xored);
}

function bufferXor(a: Buffer, b: Buffer): Buffer {
  const length = Math.max(a.length, b.length);
  const buffer = Buffer.allocUnsafe(length);

  for (let i = 0; i < length; i++) {
    buffer[i] = a[i] ^ b[i];
  }

  return buffer;
}
function ipV4BufferToString(buf: Buffer): string {
  const res = [];
  for (const digit of buf) {
    res.push(digit);
  }
  return res.join('.');
}
function ipV6BufferToString(buf: Buffer): string {
  const res = [];
  for (let i = 0; i < buf.length; i += 2) {
    res.push(buf.readUInt16BE(i).toString(16));
  }
  return res.join(':')
    .replace(/(^|:)0(:0)*:0(:|$)/, '$1::$3')
    .replace(/:{3,4}/, '::');
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
socket.send(packet, 3478, 'stun.webrtc.ecl.ntt.com');
// socket.send(packet, 19302, 'stun.l.google.com');
