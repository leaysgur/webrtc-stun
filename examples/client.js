const dgram = require('dgram');
const stun = require('..');
const pkg = require('../package.json');

const socket = dgram.createSocket({ type: 'udp4' });

const tid = stun.generateTransactionId();
socket.on('message', msg => {
  const res = stun.createBlank();

  // if msg is valid STUN message
  if (res.loadBuffer(msg)) {
    // if msg is BINDING_RESPONSE_SUCCESS
    if (res.isBindingResponseSuccess(tid)) {
      const attr = res.getXorMappedAddressAttribute();
      // if msg includes attr
      if (attr) {
        console.log('RESPONSE', res);
      }
    }
  }

  socket.close();
});

const req = stun
  .createBindingRequest(tid)
  .setSoftwareAttribute(`${pkg.name}@${pkg.version}`);
console.log('REQUEST', req);
// socket.send(req.toBuffer(), 3478, 'stun.webrtc.ecl.ntt.com');
socket.send(req.toBuffer(), 19302, 'stun.l.google.com');
// socket.send(req.toBuffer(), 55555);
