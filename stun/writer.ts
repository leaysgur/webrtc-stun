import header from './header';
import { BINDING_REQUEST } from './message-type';
import softwareAtrr from './attribute/software';

export function createBindingRequest(): Buffer {
  const attrs = Buffer.concat([
    // SHOULD
    softwareAtrr.create('webrtc-stack-study'),
  ]);

  return Buffer.concat([
    // attrs size is needed for message length
    header.create(BINDING_REQUEST, attrs.length),
    attrs,
  ]);
}
