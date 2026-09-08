import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

const dir = new URL('../assets/brand/', import.meta.url);
const mark = await readFile(new URL('trymybuild-mark.svg', dir), 'utf8');
const inner = mark.replace(/<svg[^>]*>/, '').replace('</svg>', '');
// Square, opaque artwork: the device applies its own icon corner mask.
const app = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 256 256"><rect width="256" height="256" fill="#FFF9ED"/><g transform="translate(26 26) scale(.8)">${inner}</g></svg>`);
for (const size of [1024, 512, 192, 180]) {
  await sharp(app).resize(size, size).png().toFile(new URL(`trymybuild-app-${size}.png`, dir).pathname);
}
for (const size of [16, 32]) {
  await sharp(new URL('trymybuild-favicon.svg', dir).pathname).resize(size, size).png().toFile(new URL(`favicon-${size}.png`, dir).pathname);
}
console.log('Generated app icons and small-size favicons.');
