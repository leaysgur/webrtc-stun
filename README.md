# webrtc-stun

100% TypeScript STUN implementation for WebRTC.

```
npm i webrtc-stun
```

## Supported methods
- [RFC5389](https://tools.ietf.org/html/rfc5389#section-18.1)
  - BINDING
    - REQUEST
    - RESPONSE_SUCCESS / RESPONSE_ERROR

## Not supported yet
- [RFC5389](https://tools.ietf.org/html/rfc5389#section-18.1)
  - BINDING
    - INDICATION

## Supported attributes
- [RFC5389](https://tools.ietf.org/html/rfc5389#section-18.2)
  - [MAPPED-ADDRESS](https://tools.ietf.org/html/rfc5389#section-15.1)
  - [XOR-MAPPED-ADDRESS](https://tools.ietf.org/html/rfc5389#section-15.2)
  - [USERNAME](https://tools.ietf.org/html/rfc5389#section-15.3)
  - [MESSAGE-INTEGRITY](https://tools.ietf.org/html/rfc5389#section-15.4)
  - [SOFTWARE](https://tools.ietf.org/html/rfc5389#section-15.10)
  - [FINGERPRINT](https://tools.ietf.org/html/rfc5389#section-15.5)

## Not supported yet
- [RFC5389](https://tools.ietf.org/html/rfc5389#section-18.2)
  - [ERROR-CODE](https://tools.ietf.org/html/rfc5389#section-15.6)
  - [REALM](https://tools.ietf.org/html/rfc5389#section-15.7)
  - [NONCE](https://tools.ietf.org/html/rfc5389#section-15.8)
  - [UNKNOWN-ATTRIBUTES](https://tools.ietf.org/html/rfc5389#section-15.9)
  - [ALTERNATE-SERVER](https://tools.ietf.org/html/rfc5389#section-15.11)

## Usage

```typescript
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
        console.log('my rinfo', attr);
      }
    }
  }

  socket.close();
});

const req = stun
  .createBindingRequest(tid)
  .setSoftwareAttribute(`${pkg.name}@${pkg.version}`)
  .setFingerprintAttribute();

socket.send(req.toBuffer(), 19302, 'stun.l.google.com');
```

See also `/examples` directory.
