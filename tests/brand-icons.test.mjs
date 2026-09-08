import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import sharp from 'sharp';

test('website uses the sun mark and platform icon links', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /trymybuild-mark\.svg/);
  assert.match(html, /rel="apple-touch-icon"/);
  assert.match(html, /trymybuild-favicon\.svg/);
  assert.doesNotMatch(html, /<i><\/i><i><\/i><i><\/i>/);
});

test('app icon exports are square and opaque at all requested sizes', async () => {
  for (const size of [1024, 512, 192, 180]) {
    const meta = await sharp(new URL(`../assets/brand/trymybuild-app-${size}.png`, import.meta.url).pathname).metadata();
    assert.equal(meta.width, size);
    assert.equal(meta.height, size);
    const stats = await sharp(new URL(`../assets/brand/trymybuild-app-${size}.png`, import.meta.url).pathname).stats();
    assert.equal(stats.isOpaque, true);
  }
});
