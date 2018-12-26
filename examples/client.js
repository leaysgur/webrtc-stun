const pkg = require('../package.json');
const dgram = require('dgram');
const { StunMessage } = require('..');

const socket = dgram.createSocket({ type: 'udp4' });

socket.on('message', msg => {
  const stunMessage = new StunMessage();

  // true if msg is valid STUN message
  if (stunMessage.loadBuffer(msg)) {
    // true if STUN message has BINDING_RESPONSE_SUCCESS as its type
    if (stunMessage.isBindingResponseSuccess()) {
      const attr = stunMessage.getXorMappedAddressAttribute();
      // if STUN message includes attr
      if (attr) {
        console.log(attr);
      }
    }
  }

  socket.close();
});

const packet = new StunMessage()
  .setBindingRequestType()
  .setSoftwareAttribute(`${pkg.name}@${pkg.version}`)
  .toBuffer();
// socket.send(packet, 3478, 'stun.webrtc.ecl.ntt.com');
socket.send(packet, 19302, 'stun.l.google.com');
