import * as utils from '../../src/utils';

describe('generateTransactionId()', () => {
  test('generates w/ byte(its length is *2)', () => {
    const tid1 = utils.generateTransactionId(6);
    expect(tid1.length).toBe(12);

    const tid2 = utils.generateTransactionId(12);
    expect(tid2.length).toBe(24);
  });

  test('generates random id every calls', () => {
    const tid1 = utils.generateTransactionId(12);
    const tid2 = utils.generateTransactionId(12);
    expect(tid1).not.toBe(tid2);
  });
});
