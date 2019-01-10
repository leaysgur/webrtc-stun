import * as utils from '../../../lib/internal/utils';

describe('ipV4BufferToString() / ipV4StringToBuffer()', () => {
  test('exchanges each other', () => {
    ['0.0.0.0', '192.168.0.1'].forEach(ip => {
      const $from = utils.ipV4StringToBuffer(ip);
      expect(utils.ipV4BufferToString($from)).toBe(ip);
    });
  });
});

describe('ipV6BufferToString() / ipV6StringToBuffer()', () => {
  test.skip('exchanges each other', () => {
    [
      'FF01:0:0:0:0:0:0:101',
      'FF01::101',
      '2001:DB8:0:0:8:800:200C:417A',
      '2001:DB8::8:800:200C:417A',
      '0:0:0:0:0:0:0:1',
      '::1',
      '0:0:0:0:0:0:0:0',
      '::',
      'ABCD:EF01:2345:6789:ABCD:EF01:2345:6789',
    ].forEach(ip => {
      const $from = utils.ipV6StringToBuffer(ip);
      expect(utils.ipV6BufferToString($from)).toBe(ip);
    });
  });
});
