import {
  createBindingRequest,
  createBlank,
  generateTransactionId,
} from '../src';
import { StunMessage } from '../src/message';

describe('createBlank()', () => {
  test('creates blank instance', () => {
    const blank = createBlank();
    expect(blank).toBeInstanceOf(StunMessage);
  });
});

describe('createBindingRequest()', () => {
  test('creates request', () => {
    const msg = createBindingRequest();
    expect(msg).toBeInstanceOf(StunMessage);
  });
});

describe('generateTransactionId()', () => {
  test('generates transaction ID', () => {
    expect(generateTransactionId().length).toBe(24); // = 12byte
  });
});
