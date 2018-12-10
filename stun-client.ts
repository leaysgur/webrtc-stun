/*
 * RFC 5389
 * https://tools.ietf.org/html/rfc5389
 */
import * as dgram from 'dgram';
import { createBindingRequest } from './stun';

const socket = dgram.createSocket({ type: 'udp4' });

socket.on('message', (msg: Buffer) => {
  console.log('message from server');
  // TODO: これをdecodeすれば、自分のIPとかがわかるはず
  console.log(msg.toString('hex'));
  socket.close();
});
socket.bind(12345);

const packet = createBindingRequest();
socket.send(packet, 19302, 'stun.l.google.com');
