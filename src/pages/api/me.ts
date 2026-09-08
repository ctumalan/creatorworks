import { publicWebsite } from '../../server/dashboard-policy.mjs';
import { allowRequest } from '../../server/abuse';
import type { APIRoute } from 'astro';
import { authReady, currentUser, env, json, origin } from '../../server/auth';
import { isFounder } from '../../server/admin-policy.mjs';
import { database, databaseReady, ensureMember } from '../../server/database';
import { publicName, sameOrigin } from '../../server/security.mjs';

export const GET: APIRoute = async context => {
  const user = await currentUser(context);
  if (!user) return json({ authenticated: false, authReady: authReady(), databaseReady: databaseReady() });
  if (!databaseReady()) return json({ authenticated: true, databaseReady: false, user: { displayName: [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Member' } });
  try {
    const member = await ensureMember(user);
    const result = await database().from('profiles').select('display_name,identity_label,bio,slug,is_public,avatar_path,website').eq('user_id', member.id).single();
    if (result.error) throw result.error;
    const preferences = await database().from('account_preferences').select('interests,tips,personalization').eq('user_id',member.id).maybeSingle();
    if(preferences.error) throw preferences.error;
    return json({ authenticated: true, databaseReady: true, preferences: preferences.data || {interests:[],tips:true,personalization:true}, isAdmin: isFounder(user.id, env('FOUNDER_WORKOS_USER_ID')), user: { id: member.id, avatar: result.data.avatar_path || '', displayName: result.data.display_name, label: result.data.identity_label, bio: result.data.bio, slug: result.data.slug, isPublic: result.data.is_public } });
  } catch { return json({ error: 'Your profile could not be loaded. Please try again.' }, 503); }
};

export const POST: APIRoute = async context => {
  if (!sameOrigin(context.request, origin(context))) return json({ error: 'Request not allowed.' }, 403);
  const user = await currentUser(context);
  if (!user) return json({ error: 'Please sign in.' }, 401);
  if (!user.emailVerified) return json({error:'Verify your email before making changes.'},403);
  if (!databaseReady()) return json({ error: 'Profile saving is not connected yet.' }, 503);
  try {
    if (!await allowRequest(user.id, 'me')) return json({error:'Please wait a minute before trying again.'},429);
    if (Number(context.request.headers.get('content-length')) > 200000) return json({ error: 'Profile is too long.' }, 413);
    const raw = await context.request.text(); if (raw.length > 200000) return json({error:'Profile is too long.'},413);
    const body = JSON.parse(raw);
    let avatar: string | undefined;
    if (body.avatar !== undefined) {
      if (body.avatar === '' || /^\/assets\/avatars\/(?:leaf|sun|wave|spark)\.svg$/.test(body.avatar)) avatar = body.avatar;
      else if (typeof body.avatar === 'string' && /^data:image\/(?:jpeg|png|webp);base64,/.test(body.avatar)) {
        const sharp = (await import('sharp')).default;
        const bytes = Buffer.from(body.avatar.split(',')[1], 'base64');
        const result = await sharp(bytes, {limitInputPixels:16000000}).rotate().resize(256,256,{fit:'cover'}).jpeg({quality:80}).toBuffer();
        avatar = 'data:image/jpeg;base64,' + result.toString('base64');
      } else return json({error:'Choose a suggested avatar or upload a JPG, PNG, or WebP photo.'},400);
    }
    const website = publicWebsite(body.website || ''); if(website === null) return json({error:'Use a complete https website address.'},400);
    const name = publicName(body.displayName);
    if (!name || typeof body.bio !== 'string' || body.bio.length > 500) return json({ error: 'Enter a name and a biography under 500 characters.' }, 400);
    const member = await ensureMember(user);
    const result = await database().from('profiles').update({ website, ...(avatar !== undefined ? {avatar_path:avatar || null} : {}), display_name: name, identity_label: publicName(body.label), bio: body.bio.trim(), is_public: body.isPublic === true }).eq('user_id', member.id);
    if (result.error) throw result.error;
    return json({ saved: true });
  } catch { return json({ error: 'Your profile could not be saved. Please try again.' }, 503); }
};
