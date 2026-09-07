import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';

export function authChallenge() {
  const verifier = randomBytes(48).toString('base64url');
  return { verifier, state: randomBytes(32).toString('base64url'), challenge: createHash('sha256').update(verifier).digest('base64url') };
}

export function equalState(actual, expected) {
  return typeof actual === 'string' && typeof expected === 'string' && actual.length >= 32 &&
    Buffer.byteLength(actual) === Buffer.byteLength(expected) && timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

export function sameOrigin(request, origin) {
  return request.headers.get('origin') === origin && ['same-origin', null].includes(request.headers.get('sec-fetch-site'));
}

export function publicName(value) {
  return typeof value === 'string' ? value.trim().slice(0, 60) : '';
}
