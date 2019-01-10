# webrtc-stun

100% TypeScript STUN implementation for WebRTC.

```
npm i webrtc-stun
```

Currently only supports [RFC5389](https://tools.ietf.org/html/rfc5389) and still WIP.

## Supported attribute
- [MAPPED-ADDRESS](https://tools.ietf.org/html/rfc5389#section-15.1)
- [XOR-MAPPED-ADDRESS](https://tools.ietf.org/html/rfc5389#section-15.2)
- [USERNAME](https://tools.ietf.org/html/rfc5389#section-15.3)
- [MESSAGE-INTEGRITY](https://tools.ietf.org/html/rfc5389#section-15.4)
- [SOFTWARE](https://tools.ietf.org/html/rfc5389#section-15.10)

## Not supported
- [FINGERPRINT](https://tools.ietf.org/html/rfc5389#section-15.5)
- [ERROR-CODE](https://tools.ietf.org/html/rfc5389#section-15.6)
- [REALM](https://tools.ietf.org/html/rfc5389#section-15.7)
- [NONCE](https://tools.ietf.org/html/rfc5389#section-15.8)
- [UNKNOWN-ATTRIBUTES](https://tools.ietf.org/html/rfc5389#section-15.9)
- [ALTERNATE-SERVER](https://tools.ietf.org/html/rfc5389#section-15.11)

## Usage

```javascript
const dgram = require('dgram');
const stun = require('webrtc-stun');
const pkg = require('../package.json');

const socket = dgram.createSocket({ type: 'udp4' });
const tid = stun.generateTransactionId();

socket.on('message', msg => {
  const res = stun.createBlank();

  // if msg is valid STUN message
  if (res.loadBuffer(msg)) {
    // if msg is BINDING_RESPONSE_SUCCESS and valid transaction
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
socket.send(req.toBuffer(), 19302, 'stun.l.google.com');
```

See also `examples` directory.
