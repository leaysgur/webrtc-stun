const dgram = require('dgram');
const { StunMessage } = require('..');
const pkg = require('../package.json');

const socket = dgram.createSocket({ type: 'udp4' });

socket.on('message', msg => {
  const res = StunMessage.createBlank();

  // if msg is valid STUN message
  if (res.loadBuffer(msg)) {
    // if msg is BINDING_RESPONSE_SUCCESS
    if (res.isBindingResponseSuccess()) {
      const attr = res.getXorMappedAddressAttribute();
      // if msg includes attr
      if (attr) {
        console.log('RESPONSE', res);
      }
    }
  }

  socket.close();
});

const req = StunMessage
  .createBindingRequest()
  .setSoftwareAttribute(`${pkg.name}@${pkg.version}`);
console.log('REQUEST', req);
// socket.send(req.toBuffer(), 3478, 'stun.webrtc.ecl.ntt.com');
socket.send(req.toBuffer(), 19302, 'stun.l.google.com');
// socket.send(req.toBuffer(), 55555);
