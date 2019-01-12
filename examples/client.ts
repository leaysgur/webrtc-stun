import * as dgram from 'dgram';
import * as stun from '../src';
import * as pkg from '../package.json';

const socket = dgram.createSocket({ type: 'udp4' });
const tid = stun.generateTransactionId();

socket.on('message', msg => {
  const res = stun.createBlank();

  // if msg is valid STUN message
  if (res.loadBuffer(msg)) {
    // if msg is BINDING_RESPONSE_SUCCESS and valid content
    if (
      res.isBindingResponseSuccess({
        transactionId: tid,
        fingerprint: true,
      })
    ) {
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
  .setSoftwareAttribute(`${pkg.name}@${pkg.version}`)
  .setFingerprintAttribute();

console.log('REQUEST', req);
// socket.send(req.toBuffer(), 3478, 'stun.webrtc.ecl.ntt.com');
socket.send(req.toBuffer(), 19302, 'stun.l.google.com');
// socket.send(req.toBuffer(), 55555);
