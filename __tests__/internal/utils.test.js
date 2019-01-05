const utils = require('../../lib/internal/utils');

describe('generateTransactionId()', () => {
  test('generates 12bytes(length = 24) tid', () => {
    const tid = utils.generateTransactionId();
    expect(tid.length).toBe(24);
  });
});

describe('numberToBinaryStringArray()', () => {
  test('accepts exact digit', () => {
    expect(utils.numberToBinaryStringArray(1, 4)).toHaveLength(4);
    expect(utils.numberToBinaryStringArray(1, 16)).toHaveLength(16);
  });

  test('contains 1 or 0 string only', () => {
    const ret = utils.numberToBinaryStringArray(123, 8);
    ret.forEach(b => {
      const isZeroOrOne = b === '0' || b === '1';
      expect(isZeroOrOne).toBeTruthy();
    });
  });
});

describe('calcPaddingByte()', () => {
  test('calcs pading', () => {
    const lim = 4;
    patterns = [
      [0, 0],
      [1, 3], [2, 2], [3, 1], [4, 0],
      [5, 3], [16, 0],
    ].forEach(([e, v]) => {
      expect(utils.calcPaddingByte(e, lim)).toBe(v);
    });
  });
});

describe('writeAttrBuffer()', () => {
  test('has 4byte boundary', () => {
    [
      utils.writeAttrBuffer(1, Buffer.from('')),
      utils.writeAttrBuffer(1, Buffer.from('dummy')),
      utils.writeAttrBuffer(1, Buffer.from('dummy'.repeat(100))),
    ].forEach(a => {
      expect(a.length % 4).toBe(0);
    });
  });
});

describe('ipV4BufferToString() / ipV4StringToBuffer()', () => {
  test('exchanges each other', () => {
    [
      '0.0.0.0',
      '192.168.0.1',
    ].forEach(ip => {
      const from = utils.ipV4StringToBuffer(ip);
      expect(utils.ipV4BufferToString(from)).toBe(ip)
    });
  });
});
