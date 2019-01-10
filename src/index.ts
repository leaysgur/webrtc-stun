import { StunMessage } from './message';
import { Header } from './header';
import { generateTransactionId as generateTId } from './utils';
import { STUN_MESSAGE_TYPE } from './constants';

export function createBlank(): StunMessage {
  return new StunMessage(new Header(0, generateTId(12)));
}

export function createBindingRequest(tid?: string): StunMessage {
  return new StunMessage(
    new Header(STUN_MESSAGE_TYPE.BINDING_REQUEST, tid || generateTId(12)),
  );
}

export function generateTransactionId(): string {
  return generateTId(12);
}
