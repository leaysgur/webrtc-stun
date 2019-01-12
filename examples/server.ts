import * as dgram from 'dgram';
import * as stun from '../src';

const socket = dgram.createSocket({ type: 'udp4' });

socket.on('message', (msg, rinfo) => {
  const req = stun.createBlank();

  // if msg is valid STUN message
  if (req.loadBuffer(msg)) {
    // if STUN message is BINDING_REQUEST and valid one
    if (req.isBindingRequest({ fingerprint: true })) {
      console.log('REQUEST', req);

      const res = req
        .createBindingResponse(true)
        .setXorMappedAddressAttribute(rinfo)
        .setFingerprintAttribute();

      console.log('RESPONSE', res);
      socket.send(res.toBuffer(), rinfo.port, rinfo.address);
    }
  }
});

socket.bind(55555);
