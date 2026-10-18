import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

// These assets are committed so normal builds do not need image generation.
const favicon = await readFile('public/favicon.svg');
await sharp('src/assets/social-preview.svg')
  .png()
  .toFile('public/social-preview.png');
await sharp(favicon).resize(48, 48).png().toFile('public/favicon.png');
await sharp(favicon)
  .resize(180, 180)
  .png()
  .toFile('public/apple-touch-icon.png');
console.log(
  'Generated social preview and PNG icons from editable SVG sources.',
);
