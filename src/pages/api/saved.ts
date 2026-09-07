import {allowRequest} from '../../server/abuse';
import type { APIRoute } from 'astro';
import { currentUser, json, origin } from '../../server/auth';
import { database, databaseReady, ensureMember } from '../../server/database';
import { sameOrigin } from '../../server/security.mjs';

export const GET: APIRoute = async context => {
  const user = await currentUser(context);
  if (!user) return json({ error: 'Please sign in.' }, 401);
  if (!databaseReady()) return json({ error: 'Saving is being connected.' }, 503);
  try {
    const member = await ensureMember(user);
    const { data, error } = await database().from('saved_projects').select('project_slug').eq('user_id', member.id);
    if (error) throw error;
    return json({ saved: data.map(row => row.project_slug) });
  } catch { return json({ error: 'Saved projects are temporarily unavailable.' }, 503); }
};

export const POST: APIRoute = async context => {
  if (!sameOrigin(context.request, origin(context))) return json({ error: 'Request not allowed.' }, 403);
  const user = await currentUser(context);
  if (!user) return json({ error: 'Please sign in.' }, 401);
  if (!databaseReady()) return json({ error: 'Saving is being connected.' }, 503);
  try {
    if(!user.emailVerified)return json({error:'Verify your email before saving projects.'},403);
    if(!await allowRequest(user.id,'saved',30))return json({error:'Please wait a minute.'},429);
    const raw=await context.request.text();if(raw.length>300)return json({error:'Request too large.'},413);
    const body=JSON.parse(raw);
    if (typeof body.slug !== 'string' || !/^[a-z0-9-]{1,80}$/.test(body.slug) || typeof body.saved !== 'boolean') return json({ error: 'Invalid project.' }, 400);
    const member = await ensureMember(user);
    const db = database();
    const project = await db.from('projects').select('slug').eq('slug', body.slug).eq('listing_status', 'published').maybeSingle();
    if (!project.data) return json({ error: 'Project not found.' }, 404);
    const result = body.saved
      ? await db.from('saved_projects').upsert({ user_id: member.id, project_slug: body.slug })
      : await db.from('saved_projects').delete().eq('user_id', member.id).eq('project_slug', body.slug);
    if (result.error) throw result.error;
    return json({ saved: body.saved });
  } catch { return json({ error: 'Could not save that change. Please try again.' }, 503); }
};
