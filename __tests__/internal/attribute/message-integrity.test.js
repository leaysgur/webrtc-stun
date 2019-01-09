const { MessageIntegrityAttribute } = require('../../../lib/internal/attribute/message-integrity');

describe('static createBlank()', () => {
  test('create blank instance', () => {
    const blank = MessageIntegrityAttribute.createBlank();
    expect(blank).toBeInstanceOf(MessageIntegrityAttribute);
  });
});

describe('constructor()', () => {
  const attr = new MessageIntegrityAttribute();

  test('has type', () => {
    expect(attr.type).toBe(0x0008);
  });

  test('has payload', () => {
    expect(attr.payload).toHaveProperty('value');
    expect(Buffer.isBuffer(attr.payload.value)).toBeTruthy();
  });
});

describe('toBuffer()', () => {
  test('returns buffer', () => {
    const attr = new MessageIntegrityAttribute();

    const $buf = Buffer.from(
      '0008' + '0014' +
      '0000000000000000000000000000000000000000'
    , 'hex');
    expect(attr.toBuffer().equals($buf)).toBeTruthy();
  });
});

describe('loadBuffer()', () => {
  test('loads from buffer', () => {
    const $buf = Buffer.from('0000000000000000000000000000000000000000', 'hex');

    const blank = MessageIntegrityAttribute.createBlank();
    expect(blank.loadBuffer($buf)).toBeTruthy();
    expect(blank.payload.value.equals($buf)).toBeTruthy();
  });

  test('does not update length', () => {
    const blank = MessageIntegrityAttribute.createBlank();
    expect(blank.payload.value.length).toBe(20);

    const $buf1 = Buffer.from('0000000000000000000000000000000000000000', 'hex');
    expect(blank.loadBuffer($buf1)).toBeTruthy();
    expect(blank.payload.value.length).toBe(20);

    const $buf2 = Buffer.from('00000000000000000000000000000000000000000000000000000000000000000000000000000000', 'hex');
    expect(blank.loadBuffer($buf2)).toBeTruthy();
    expect(blank.payload.value.length).toBe(20);

    const $buf3 = Buffer.from('', 'hex');
    expect(blank.loadBuffer($buf3)).toBeTruthy();
    expect(blank.payload.value.length).toBe(20);
  });
});
