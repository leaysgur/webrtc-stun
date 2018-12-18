import * as dgram from 'dgram';
import {
  StunMessage,
  Header,
  SoftwareAttribute,
  isStunMessage,
  // parseStunMessage,
  STUN_MESSAGE_TYPE,
  // STUN_ATTRIBUTE_TYPE,
} from '../stun';

const socket = dgram.createSocket({ type: 'udp4' });

socket.on('message', (msg: Buffer) => {
  if (!isStunMessage(msg)) {
    console.log('not a stun packet', msg.toString('hex'));
    socket.close();
    return;
  }

  const stunMsg = StunMessage.fromBuffer(msg);
  console.log(stunMsg);
  // switch (header.type) {
  //   case STUN_MESSAGE_TYPE.BINDING_RESPONSE_SUCCESS:
  //     console.log('BINDING_RESPONSE_SUCCESS');
  //     break;
  //   case STUN_MESSAGE_TYPE.BINDING_RESPONSE_ERROR:
  //     console.log('BINDING_RESPONSE_ERROR');
  //     break;
  // }

  socket.close();
});

const header = new Header();
header.setType(STUN_MESSAGE_TYPE.BINDING_REQUEST);
const softwareAttr = new SoftwareAttribute('webrtc-stack-study');

const packet = new StunMessage(header, [softwareAttr]).toBuffer();

socket.send(packet, 3478, 'stun.webrtc.ecl.ntt.com');
// socket.send(packet, 19302, 'stun.l.google.com');
