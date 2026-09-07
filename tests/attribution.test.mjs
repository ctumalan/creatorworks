import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('launch collection uses in-house attribution, not fictional people', () => {
  const source = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
  assert.match(source, /project\.creatorSlug = "creatorworks-studio"/);
  assert.match(source, /name: "CreatorWorks Studio"/);
  assert.doesNotMatch(source, /demoPeople|demoCreatorSlug|isDemo|Amy Chen|Diego Saavedra/);
});
