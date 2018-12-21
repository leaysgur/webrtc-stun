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
    return;
  }

  const { header, body } = parseStunMessage(msg);

  if (header.type === STUN_MESSAGE_TYPE.BINDING_REQUEST) {
    // TODO: create BINDING_RESPONSE_SUCCESS w/ XOR_MAPPED_ADDRESS
    const packet = createStunMessage({
      header: new Header(STUN_MESSAGE_TYPE.BINDING_RESPONSE_SUCCESS),
      body: [],
    });
    socket.send(packet, rinfo.port, rinfo.address);
  } else {
    console.log(header.type);
    console.log(body);
  }

});

socket.bind(55555);
