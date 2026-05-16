// One-shot QR generator. Renders public/dhruv-qr.png pointing at the live card.
// Run via `npm run qr` whenever the destination URL or brand color changes.

import QRCode from 'qrcode';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TARGET = 'https://fermionsoftwaresolutions.com/dhruv';
const OUT = resolve(__dirname, '../public/dhruv-qr.png');

await QRCode.toFile(OUT, TARGET, {
  type: 'png',
  errorCorrectionLevel: 'H',
  width: 1024,
  margin: 2,
  color: {
    dark: '#050b2e',
    light: '#ffffff'
  }
});
console.log(`Wrote ${OUT} → ${TARGET}`);
