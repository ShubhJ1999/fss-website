import sharp from 'sharp';
import jsQR from 'jsqr';

const file = process.argv[2];
const { data, info } = await sharp(file)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const clamped = new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength);
const result = jsQR(clamped, info.width, info.height);
if (!result) {
  console.log('DECODE FAILED');
  process.exit(1);
}
console.log('Decoded URL :', result.data);
console.log('Version     :', result.version);
console.log('Image size  :', info.width, 'x', info.height);
