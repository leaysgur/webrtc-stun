import header from './internal/header';
import softwareAtrr from './internal/attribute/software';
import { STUN_MESSAGE_TYPE } from './message-type';

export function createStunBindingRequest(softwareName: string): Buffer {
  const attrs = Buffer.concat([
    // SHOULD
    softwareAtrr.create(softwareName),
  ]);

  return Buffer.concat([
    // attrs size is needed for message length
    header.create(STUN_MESSAGE_TYPE.BINDING_REQUEST, attrs.length),
    attrs,
  ]);
}
