import * as utils from '../../src/utils';

describe('bufferXor()', () => {
  test('xor buffer properly', () => {
    const b1 = Buffer.from('0f00f0', 'hex');
    const b2 = Buffer.from('00f00f', 'hex');
    const ex = Buffer.from('0ff0ff', 'hex');
    expect(utils.bufferXor(b1, b2).equals(ex)).toBeTruthy();
  });

  test('throws if buffers have different length', () => {
    expect(() => {
      const b1 = Buffer.from([1, 2, 3]);
      const b2 = Buffer.from([1, 2, 3, 4]);
      utils.bufferXor(b1, b2);
    }).toThrow();
  });
});
