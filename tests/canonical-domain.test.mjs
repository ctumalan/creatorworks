import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalDestination as target} from '../src/server/canonical-domain.mjs';
const origin = 'https://trymybuild.com';
test('legacy pages and www preserve their destination on the new domain', () => {
  assert.equal(target('https://creatorworks.vercel.app/?category=Family+life','GET',origin), origin+'/?category=Family+life');
  assert.equal(target('https://www.trymybuild.com/dashboard','HEAD',origin), origin+'/dashboard');
});
test('domain transition leaves callbacks, API calls, writes and previews alone', () => {
  for (const path of ['/auth/callback?code=test','/api/catalog']) assert.equal(target('https://creatorworks.vercel.app'+path,'GET',origin),null);
  assert.equal(target('https://creatorworks.vercel.app/dashboard','POST',origin),null);
  assert.equal(target('https://preview.vercel.app/','GET',origin),null);
  assert.equal(target(origin+'/','GET',origin),null);
  assert.equal(target('https://creatorworks.vercel.app/','GET',''),null);
});
