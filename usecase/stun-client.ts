import * as dgram from 'dgram';
import {
  createStunBindingRequest,
  isStunMessage,
  parseStunMessage,
  BINDING_RESPONSE_SUCCESS,
  BINDING_RESPONSE_ERROR,
  XOR_MAPPED_ADDRESS,
  SOFTWARE,
} from '../stun';

const socket = dgram.createSocket({ type: 'udp4' });
socket.on('message', (msg: Buffer) => {
  if (!isStunMessage(msg)) {
    console.log('not a stun packet', msg.toString('hex'));
    socket.close();
    return;
  }

  console.log('recv');
  console.log(msg.toString('hex'));
  const { header, attrs } = parseStunMessage(msg);
  console.log(attrs.keys());
  console.log('SOFTWARE ?', attrs.has(SOFTWARE));
  console.log('XOR_MAPPED_ADDRESS', attrs.has(XOR_MAPPED_ADDRESS));

  switch (header.type) {
    case BINDING_RESPONSE_SUCCESS:
      console.log('BINDING_RESPONSE_SUCCESS');
      break;
    case BINDING_RESPONSE_ERROR:
      console.log('BINDING_RESPONSE_ERROR');
      break;
  }

  socket.close();
});
socket.bind(12345);

const packet = createStunBindingRequest('webrtc-stack-study');
console.log('send');
console.log(packet.toString('hex'));
socket.send(packet, 3478, 'stun.webrtc.ecl.ntt.com');
// socket.send(packet, 19302, 'stun.l.google.com');
