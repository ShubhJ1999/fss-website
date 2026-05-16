// One-shot QR generator with the Fermion mark in the centre. Renders
// public/dhruv-qr.png pointing at the live card. Run via `npm run qr` whenever
// the destination URL, brand color, or logo changes.

import QRCode from 'qrcode';
import sharp from 'sharp';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TARGET = 'https://fermionsoftwaresolutions.com/dhruv';
const OUT = resolve(__dirname, '../public/dhruv-qr.png');
const LOGO = resolve(__dirname, '../public/fss-logo.png');

const QR_SIZE = 1024;
const LOGO_SIZE = 200;
const PAD = 28; // white border around the logo
const PAD_SIZE = LOGO_SIZE + PAD * 2;
const PAD_RADIUS = 24;

// QR (error correction H tolerates ~30% loss — covers the centre overlay).
const qrBuffer = await QRCode.toBuffer(TARGET, {
  type: 'png',
  errorCorrectionLevel: 'H',
  width: QR_SIZE,
  margin: 2,
  color: { dark: '#050b2e', light: '#ffffff' }
});

// White rounded-square pad so the logo doesn't blur into the QR cells.
const padSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${PAD_SIZE}" height="${PAD_SIZE}">
     <rect width="${PAD_SIZE}" height="${PAD_SIZE}" rx="${PAD_RADIUS}" ry="${PAD_RADIUS}" fill="#ffffff"/>
   </svg>`
);

// Logo resized to fit the pad. fit:contain keeps aspect ratio; navy-on-cyan
// reads cleanly at this size.
const logoBuffer = await sharp(LOGO)
  .resize(LOGO_SIZE, LOGO_SIZE, { fit: 'contain', background: { r: 5, g: 11, b: 46, alpha: 1 } })
  .toBuffer();

const padTopLeft = Math.round((QR_SIZE - PAD_SIZE) / 2);
const logoTopLeft = Math.round((QR_SIZE - LOGO_SIZE) / 2);

await sharp(qrBuffer)
  .composite([
    { input: padSvg, top: padTopLeft, left: padTopLeft },
    { input: logoBuffer, top: logoTopLeft, left: logoTopLeft }
  ])
  .png()
  .toFile(OUT);

console.log(`Wrote ${OUT} → ${TARGET}`);
