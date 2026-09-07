import { createHmac, timingSafeEqual } from 'node:crypto';

export function signProof(userId, purpose, secret, now = Date.now()) {
  if (!secret || secret.length < 32) throw new Error('Security configuration unavailable');
  const payload = Buffer.from(JSON.stringify({ userId, purpose, at: now })).toString('base64url');
  return `${payload}.${createHmac('sha256', secret).update(payload).digest('base64url')}`;
}
export function validProof(value, userId, purpose, secret, now = Date.now()) {
  try {
    if (!secret || secret.length < 32 || typeof value !== 'string' || value.length > 1200) return false;
    const parts = value.split('.'); if (parts.length !== 2) return false;
    const signature = createHmac('sha256', secret).update(parts[0]).digest();
    const received = Buffer.from(parts[1], 'base64url');
    if (received.length !== signature.length || !timingSafeEqual(signature, received)) return false;
    const p = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    return p.userId === userId && p.purpose === purpose && Number.isFinite(p.at) && now >= p.at && now - p.at < 300000;
  } catch { return false; }
}
export function signInDescription(method) {
  const labels = { Password: 'Email and password', GoogleOAuth: 'Google', GitHubOAuth: 'GitHub', MicrosoftOAuth: 'Microsoft', AppleOAuth: 'Apple', MagicAuth: 'Email sign-in code', SSO: 'Organization single sign-on', Passkey: 'Passkey' };
  return labels[method] || 'Managed sign-in';
}
export async function revokeAllSessions(api, userId) {
  const sessions = await (await api.listSessions(userId)).autoPagination();
  let failures = 0;
  for (const session of sessions) {
    if (session.userId !== userId) throw new Error('Unexpected session owner');
    if (session.status !== 'active') continue;
    try { await api.revokeSession({sessionId: session.id}); } catch { failures++; }
  }
  if (failures) throw new Error('Some sessions could not be revoked');
}
