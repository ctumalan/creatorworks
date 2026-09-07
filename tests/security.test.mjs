import test from 'node:test';
import assert from 'node:assert/strict';
import { authChallenge, equalState, sameOrigin, publicName } from '../src/server/security.mjs';

test('OAuth state and PKCE are unpredictable and independent', () => {
  const first = authChallenge(); const second = authChallenge();
  assert.notEqual(first.state, second.state);
  assert.notEqual(first.verifier, second.verifier);
  assert.equal(first.challenge.length, 43);
  assert.equal(equalState(first.state, first.state), true);
  for (const wrong of [null, undefined, '', second.state, first.state + 'x']) assert.equal(equalState(wrong, first.state), false);
});
test('writes reject foreign origins and missing origin', () => {
  assert.equal(sameOrigin(new Request('https://cw.example', { headers: { origin: 'https://cw.example' } }), 'https://cw.example'), true);
  assert.equal(sameOrigin(new Request('https://cw.example', { headers: { origin: 'https://evil.example' } }), 'https://cw.example'), false);
  assert.equal(sameOrigin(new Request('https://cw.example'), 'https://cw.example'), false);
});
test('public labels cannot supply authority or unbounded data', () => {
  assert.equal(publicName({ system_role: 'admin' }), '');
  assert.equal(publicName('x'.repeat(200)).length, 60);
});
