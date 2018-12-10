import { createHeader } from './header';
import { createSoftware } from './attribute';

export function createBindingRequest(): Buffer {
  const body = Buffer.concat([
    // SHOULD
    createSoftware()
  ]);

  // body size is needed for message length
  const header = createHeader(body.length);

  return Buffer.concat([header, body]);
}
