import { SOFTWARE } from '../../attribute-type';
import { calcPaddingByte } from '../utils';

function create(softwareName: string): Buffer {
  // allocate dynamically for value
  const value = Buffer.from(softwareName);

  // 2byte(16bit) for type
  const type = Buffer.alloc(2);
  type.writeUInt16BE(SOFTWARE, 0);

  // 2byte(16bit) for length
  const length = Buffer.alloc(2);
  length.writeUInt16BE(value.length, 0);

  // Value must be in N * 32 bit w/ padding bit (= 4N byte)
  // pad missing bytes
  const paddingByte = calcPaddingByte(value.length, 4);
  const padding = Buffer.alloc(paddingByte);

  return Buffer.concat([type, length, value, padding]);
}

function parse() {
  // TODO: impl
}

export default { create, parse }
