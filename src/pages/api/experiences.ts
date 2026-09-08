import { allowRequest } from '../../server/abuse';
import type { APIRoute } from 'astro';
import { currentUser, json, origin } from '../../server/auth';
import { database, databaseReady, ensureMember } from '../../server/database';
import { sameOrigin } from '../../server/security.mjs';
import { thoughtfulComment } from '../../server/feedback-policy.mjs';

export const GET: APIRoute = async () => {
  if (!databaseReady()) return json({ posts: [], connected: false });
  const result = await database().from('project_experiences').select('id,project_slug,response,created_at,author_user_id').eq('moderation_status', 'published').order('created_at', { ascending: false }).limit(100);
  if (result.error) return json({ error: 'Community is temporarily unavailable.' }, 503);
  const ids = [...new Set(result.data.map(row => row.author_user_id))];
  const profiles = ids.length ? await database().from('profiles').select('user_id,display_name,identity_label,avatar_path').in('user_id', ids) : { data: [], error: null };
  if (profiles.error) return json({ error: 'Community is temporarily unavailable.' }, 503);
  return json({ connected: true, posts: result.data.map(row => {
    const profile = profiles.data?.find(item => item.user_id === row.author_user_id);
    const author: string = profile?.display_name || 'Member';
    return { id: row.id, projectSlug: row.project_slug, response: row.response, author, avatar: profile?.avatar_path || '', label: profile?.identity_label || 'TryMyBuild member', initials: author.split(/\s+/).slice(0, 2).map(word => word[0]).join(''), createdAt: row.created_at, source: 'community', signals: [] };
  }) });
};

export const POST: APIRoute = async context => {
  if (!sameOrigin(context.request, origin(context))) return json({ error: 'Request not allowed.' }, 403);
  const user = await currentUser(context);
  if (!user) return json({ error: 'Please sign in to share your experience.' }, 401);
  if (!user.emailVerified) return json({error:'Verify your email before posting.'},403);
  if (!databaseReady()) return json({ error: 'Community sharing is being connected.' }, 503);
  try {
    if (!await allowRequest(user.id, 'experiences')) return json({error:'Please wait a minute before trying again.'},429);
    const body = await context.request.json();
    if (!thoughtfulComment(body.response) || typeof body.slug !== 'string') return json({ error: 'Please share a thoughtful observation of 7–150 words.' }, 400);
    const member = await ensureMember(user);
    const db = database();
    const project = await db.from('projects').select('slug').eq('slug', body.slug).eq('visibility', 'public').maybeSingle();
    if (!project.data) return json({ error: 'Project not found.' }, 404);
    const result = await db.from('project_experiences').upsert({ project_slug: body.slug, author_user_id: member.id, response: body.response.trim(), moderation_status: 'pending' }, { onConflict: 'project_slug,author_user_id' }).select('id').single();
    if (result.error) throw result.error;
    return json({ saved: true, message: 'Your experience has been sent for review.' });
  } catch { return json({ error: 'Your experience could not be sent. Please try again.' }, 503); }
};
