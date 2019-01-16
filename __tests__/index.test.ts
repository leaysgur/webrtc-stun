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

  test('throws if invalid tid passed', () => {
    expect(() => {
      createBindingRequest('invalid');
    }).toThrow();
  });

  test('does not throw if valid tid passed', () => {
    expect(() => {
      createBindingRequest(generateTransactionId());
    }).not.toThrow();
  });
});

describe('generateTransactionId()', () => {
  test('generates transaction ID', () => {
    expect(generateTransactionId().length).toBe(24); // = 12byte
  });
});
