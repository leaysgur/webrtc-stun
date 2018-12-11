import * as dgram from 'dgram';
import {
  createBindingRequest,
  isStunMessage,
  parseMessage,
  BINDING_RESPONSE_SUCCESS,
  BINDING_RESPONSE_ERROR,
} from '../stun';

const socket = dgram.createSocket({ type: 'udp4' });
socket.on('message', (msg: Buffer) => {
  if (!isStunMessage(msg)) {
    console.log('not a stun packet', msg.toString('hex'));
    socket.close();
    return;
  }

  const { header, attrs } = parseMessage(msg);
  for (const attr of attrs) {
    console.log(attr);
  }

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

const packet = createBindingRequest();
// socket.send(packet, 3478, 'stun.webrtc.ecl.ntt.com');
socket.send(packet, 19302, 'stun.l.google.com');
