// A display name, email, badge, or browser field must never grant authority.
export function isFounder(userId, configuredId) {
  return typeof userId === 'string' && typeof configuredId === 'string'
    && /^user_[A-Za-z0-9]+$/.test(configuredId) && userId === configuredId;
}
export function moderationInput(body) {
  if (!/^[0-9a-f-]{36}$/i.test(body.id || '') || !['published', 'hidden', 'pending'].includes(body.status)
    || typeof body.reason !== 'string' || body.reason.trim().length < 3 || body.reason.length > 300
    || typeof body.expected !== 'string' || body.expected.length > 800
    || !['published', 'hidden', 'pending'].includes(body.previous)) return null;
  return { id: body.id, status: body.status, reason: body.reason.trim(), expected: body.expected, previous: body.previous };
}
