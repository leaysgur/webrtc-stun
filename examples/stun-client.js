const dgram = require('dgram');
const {
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
} = require('..');

const socket = dgram.createSocket({ type: 'udp4' });

socket.on('message', msg => {
  // ignore non-related packets
  if (!isStunMessage(msg)) {
    console.log('not a stun packet', msg.toString('hex'));
    return;
  }

  const { header, body } = parseStunMessage(msg);

  if (header.type === STUN_MESSAGE_TYPE.BINDING_RESPONSE_SUCCESS) {
    const xorMappedAddress = body.find(
      i => i.type === STUN_ATTRIBUTE_TYPE.XOR_MAPPED_ADDRESS,
    );

    if (xorMappedAddress) {
      const attr = xorMappedAddress; // as XorMappedAddressAttribute;
      console.log(`Your IP is ${attr.payload.address}`);
    }
  }

  socket.close();
});

const packet = createStunMessage({
  header: new Header(STUN_MESSAGE_TYPE.BINDING_REQUEST),
  body: [new SoftwareAttribute('webrtc-stack-study')],
});
socket.send(packet, 3478, 'stun.webrtc.ecl.ntt.com');
// socket.send(packet, 19302, 'stun.l.google.com');
