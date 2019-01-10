import * as utils from '../../../lib/internal/utils';

describe('generateTransactionId()', () => {
  test('generates 12bytes(length = 24) tid', () => {
    const tid = utils.generateTransactionId();
    expect(tid.length).toBe(24);
  });

  test('generates random id every calls', () => {
    const tid1 = utils.generateTransactionId();
    const tid2 = utils.generateTransactionId();
    expect(tid1).not.toBe(tid2);
  });
});
