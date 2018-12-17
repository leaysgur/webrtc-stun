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
function parseXorMappedAddress(buf: Buffer, magicCookie: number) {
  const family = buf.readUInt16BE(0);
  const ipVersion = {
    [`${0x01}`]: 'IPv4',
    [`${0x02}`]: 'IPv6',
  }[family];

  const xport = buf.readUInt16BE(2);
  // use first 16bit
  const mc16bit = magicCookie >> 16;
  // XOR
  const port = xport ^ mc16bit;

  // TODO: xaddress

  return { ipVersion, port };
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
  console.log(parseXorMappedAddress(attrs.get(STUN_ATTRIBUTE_TYPE.XOR_MAPPED_ADDRESS)!.value, header.magicCookie));

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
