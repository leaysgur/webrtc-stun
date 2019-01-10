const dgram = require('dgram');
const stun = require('..');

const socket = dgram.createSocket({ type: 'udp4' });

socket.on('message', (msg, rinfo) => {
  const req = stun.createBlank();

  // if msg is valid STUN message
  if (req.loadBuffer(msg)) {
    // if STUN message has BINDING_REQUEST as its type
    if (req.isBindingRequest()) {
      console.log('REQUEST', req);
      const res = req
        .createBindingResponse(true)
        .setXorMappedAddressAttribute(rinfo);
      console.log('RESPONSE', res);
      socket.send(res.toBuffer(), rinfo.port, rinfo.address);
    }
  }
});

socket.bind(55555);
