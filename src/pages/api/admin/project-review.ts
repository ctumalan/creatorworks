import type { APIRoute } from 'astro';
import { adminUser } from '../../../server/admin';
import { origin, json } from '../../../server/auth';
import { database, ensureMember } from '../../../server/database';
import { sameOrigin } from '../../../server/security.mjs';
import { validId } from '../../../server/feedback-policy.mjs';

const STATUSES = ['published', 'unpublished', 'in_review', 'draft'];

// Founder-only decision on a submitted listing. Optimistic concurrency on the prior status (inside
// cw_review_project) prevents a double-publish from a retry or double-click.
export const POST: APIRoute = async context => {
  if (!sameOrigin(context.request, origin(context))) return json({ error: 'Request not allowed.' }, 403);
  const user = await adminUser(context);
  if (!user) return json({ error: 'Administrator access required.' }, 403);
  try {
    const raw = await context.request.text();
    if (raw.length > 12000) return json({ error: 'Request too large.' }, 413);
    const body = Object.fromEntries(new URLSearchParams(raw));
    const version = Number(body.version);
    if (!validId(body.id) || !STATUSES.includes(body.previous) || !STATUSES.includes(body.status) || body.confirm !== 'yes'
        || (body.reason || '').length > 300 || !Number.isInteger(version) || version < 0) {
      return json({ error: 'Confirm a valid decision.' }, 400);
    }
    const actor = await ensureMember(user);
    // Bind the decision to the exact revision shown in the review form (status + lock_version).
    const result = await database().rpc('cw_review_project', { p_actor: actor.id, p_id: body.id, p_previous: body.previous, p_expected_version: version, p_status: body.status, p_reason: (body.reason || '').trim() });
    if (result.error) return context.redirect('/admin?section=projects&notice=retry', 303);
    return context.redirect('/admin?section=projects&notice=saved', 303);
  } catch { return context.redirect('/admin?section=projects&notice=retry', 303); }
};
