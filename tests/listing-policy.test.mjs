import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeCategory, normalizeStage, normalizeExternalUrl, normalizeDraft,
  publishReadiness, canViewProject, slugify, detectImageType, validateImageUpload, parseImageDataUrl,
} from '../src/server/listing-policy.mjs';

test('category normalization maps aliases, blocks admin words, title-cases the rest', () => {
  assert.equal(normalizeCategory('ai'), 'AI & automation');
  assert.equal(normalizeCategory('  music  '), 'Music & audio');
  assert.equal(normalizeCategory('admin'), '', 'admin is a blocked category word');
  assert.equal(normalizeCategory('a'), '', 'too short');
  assert.equal(normalizeCategory('underwater basket weaving'), 'Underwater Basket Weaving');
});

test('external url accepts public http/https only, rejects credentials and junk', () => {
  assert.equal(normalizeExternalUrl('https://example.com/app'), 'https://example.com/app');
  assert.equal(normalizeExternalUrl('http://x.io'), 'http://x.io/');
  assert.equal(normalizeExternalUrl('ftp://example.com'), '');
  assert.equal(normalizeExternalUrl('https://user:pass@example.com'), '');
  assert.equal(normalizeExternalUrl('not a url'), '');
});

test('stage falls back to a safe default', () => {
  assert.equal(normalizeStage('Finished and launched'), 'Finished and launched');
  assert.equal(normalizeStage('nonsense'), 'Ready for a first try');
});

test('normalizeDraft maps builder fields and rejects a broken link', () => {
  const { value } = normalizeDraft({ title: 'My Tool', url: 'https://mytool.app', category: 'ai', stage: 'x', does: 'Does a useful thing', helps: 'Helps you plan your day', firstTry: 'Try this useful feature first' });
  assert.equal(value.title, 'My Tool');
  assert.equal(value.external_url, 'https://mytool.app/');
  assert.equal(value.category, 'AI & automation');
  assert.equal(value.headline, 'Does a useful thing');
  assert.equal(value.help_text, 'Helps you plan your day');
  assert.equal(value.first_try, 'Try this useful feature first');
  const bad = normalizeDraft({ title: 'X', url: 'javascript:alert(1)' });
  assert.ok(bad.error, 'invalid link is rejected');
});

test('publishReadiness lists exactly what is missing and passes a complete draft', () => {
  const empty = publishReadiness({});
  assert.equal(empty.ready, false);
  assert.ok(empty.missing.includes('project name'));
  assert.ok(empty.missing.includes('a preview screenshot'));
  const complete = publishReadiness({
    title: 'T', external_url: 'https://t.app', category: 'Tech', headline: 'Plan meals for your family',
    help_text: 'Make dinner decisions more easily', first_try: 'Add ingredients from your fridge', preview_path: 'previews/x/y.jpg',
  });
  assert.deepEqual(complete, { ready: true, missing: [] });
});

test('canViewProject: published is public; drafts are owner/admin only', () => {
  const draft = { listing_status: 'draft', owner_user_id: 'u1' };
  const pub = { listing_status: 'published', owner_user_id: 'u1' };
  assert.equal(canViewProject(pub, null, false), true, 'anyone sees published');
  assert.equal(canViewProject(draft, null, false), false, 'anon cannot see a draft');
  assert.equal(canViewProject(draft, 'u2', false), false, 'another member cannot see a draft');
  assert.equal(canViewProject(draft, 'u1', false), true, 'owner sees own draft');
  assert.equal(canViewProject(draft, 'u2', true), true, 'admin sees any draft');
});

test('slugify produces a safe base slug', () => {
  assert.equal(slugify('My Cool Tool!!'), 'my-cool-tool');
  assert.equal(slugify('   '), 'project');
});

test('image magic-byte detection and upload validation', () => {
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0, 0, 0, 0, 0]);
  const webp = Buffer.from([0x52,0x49,0x46,0x46,0,0,0,0,0x57,0x45,0x42,0x50]);
  const script = Buffer.from('<script>alert(1)</script>');
  assert.equal(detectImageType(jpeg), 'image/jpeg');
  assert.equal(detectImageType(png), 'image/png');
  assert.equal(detectImageType(webp), 'image/webp');
  assert.equal(detectImageType(script), '');
  assert.ok(validateImageUpload(script).error, 'non-image rejected');
  assert.ok(validateImageUpload(Buffer.alloc(0)).error, 'empty rejected');
  assert.ok(validateImageUpload(Buffer.concat([jpeg, Buffer.alloc(3_000_001)])).error, 'oversize rejected');
  assert.equal(validateImageUpload(jpeg).type, 'image/jpeg');
});

test('parseImageDataUrl accepts a clean jpeg data url and rejects a fake one', () => {
  const bytes = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(20)]);
  const url = 'data:image/jpeg;base64,' + bytes.toString('base64');
  const parsed = parseImageDataUrl(url);
  assert.ok(parsed && parsed.type === 'image/jpeg');
  assert.equal(parseImageDataUrl('data:text/html;base64,AAAA'), null);
  assert.equal(parseImageDataUrl('data:image/jpeg;base64,' + Buffer.from('notjpeg').toString('base64')), null);
});
