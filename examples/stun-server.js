const dgram = require('dgram');
const {
  // STUN Message creator
  isStunMessage,
  createStunMessage,
  parseStunMessage,
  // combine these to create STUN message
  Header,
  XorMappedAddressAttribute,
  // constants to process
  STUN_MESSAGE_TYPE,
  STUN_ATTRIBUTE_TYPE,
} = require('..');

const socket = dgram.createSocket({ type: 'udp4' });

socket.on('message', (msg, rinfo) => {
  if (!isStunMessage(msg)) {
    console.log(msg);
    return;
  }

  const req = parseStunMessage(msg);

  if (req.header.type === STUN_MESSAGE_TYPE.BINDING_REQUEST) {
    const header = new Header(STUN_MESSAGE_TYPE.BINDING_RESPONSE_SUCCESS);
    header.setTransactionId(req.header.transactionId);
    const packet = createStunMessage({
      header,
      body: [new XorMappedAddressAttribute(4, rinfo.port, rinfo.address)],
    });

    socket.send(packet, rinfo.port, rinfo.address);
  }
});

socket.bind(55555);
