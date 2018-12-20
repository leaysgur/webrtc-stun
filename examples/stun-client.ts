import * as dgram from 'dgram';
import {
  // STUN Message creator
  isStunMessage,
  createStunMessage,
  parseStunMessage,
  // combine these to create STUN message
  Header,
  SoftwareAttribute,
  XorMappedAddressAttribute,
  // constants to process
  STUN_MESSAGE_TYPE,
  STUN_ATTRIBUTE_TYPE,
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
      const xorMappedAddress = body.find(
        i => i.type === STUN_ATTRIBUTE_TYPE.XOR_MAPPED_ADDRESS,
      );

      if (xorMappedAddress) {
        const attr = xorMappedAddress as XorMappedAddressAttribute;
        console.log(`Your IP is ${attr.payload.address}`);
      }
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
