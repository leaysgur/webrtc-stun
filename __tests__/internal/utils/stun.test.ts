import * as utils from '../../../lib/internal/utils';

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
    [[0, 0], [1, 3], [2, 2], [3, 1], [4, 0], [5, 3], [16, 0]].forEach(
      ([e, v]) => {
        expect(utils.calcPaddingByte(e, lim)).toBe(v);
      },
    );
  });
});

describe('writeAttrBuffer()', () => {
  test('has 4byte boundary', () => {
    [
      utils.writeAttrBuffer(1, Buffer.from('')),
      utils.writeAttrBuffer(1, Buffer.from('dummy')),
      utils.writeAttrBuffer(1, Buffer.from('dummy'.repeat(100))),
    ].forEach($attr => {
      expect($attr.length % 4).toBe(0);
    });
  });
});
