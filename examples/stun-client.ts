import * as dgram from 'dgram';
import {
  isStunMessage,
  createStunMessage,
  parseStunMessage,
  Header,
  SoftwareAttribute,
  STUN_MESSAGE_TYPE,
  // STUN_ATTRIBUTE_TYPE,
} from '../src';

const socket = dgram.createSocket({ type: 'udp4' });

socket.on('message', (msg: Buffer) => {
  if (!isStunMessage(msg)) {
    console.log('not a stun packet', msg.toString('hex'));
    socket.close();
    return;
  }

  const { header, body } = parseStunMessage(msg);

  switch (header.type) {
    case STUN_MESSAGE_TYPE.BINDING_RESPONSE_SUCCESS:
      console.log('BINDING_RESPONSE_SUCCESS');
      console.log(body);
      // const xorMappedAddress = body.getAttribute(STUN_ATTRIBUTE_TYPE.XOR_MAPPED_ADDRESS);
      // if (xorMappedAddress !== null) {
      //   console.log(xorMappedAddress.toJSON());
      // }
      break;
    case STUN_MESSAGE_TYPE.BINDING_RESPONSE_ERROR:
      console.log('BINDING_RESPONSE_ERROR');
      break;
  }

  socket.close();
});

const packet = createStunMessage({
  header: new Header(STUN_MESSAGE_TYPE.BINDING_REQUEST),
  body: [new SoftwareAttribute('webrtc-stack-study')],
});
socket.send(packet, 3478, 'stun.webrtc.ecl.ntt.com');
// socket.send(packet, 19302, 'stun.l.google.com');
