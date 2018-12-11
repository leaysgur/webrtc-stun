import { createHeader } from './header';
import { BINDING_REQUEST } from './message-type';
import { createSoftwareAttribute } from './attribute';

export function createBindingRequest(): Buffer {
  const attrs = Buffer.concat([
    // SHOULD
    createSoftwareAttribute('webrtc-stack-study'),
  ]);

  // attrs size is needed for message length
  const header = createHeader(
    BINDING_REQUEST,
    attrs.length
  );

  return Buffer.concat([header, attrs]);
}
