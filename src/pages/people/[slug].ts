import { listPublished } from '../../server/catalog-db';
import { projectCard,publicActions } from '../../server/project-ui';
import type { APIRoute } from 'astro';
import { database, databaseReady } from '../../server/database';
const escape = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]!));

export const GET: APIRoute = async ({ params }) => {
  if (!databaseReady()) return new Response('Profiles are being connected.', { status: 503 });
  const db = database();
  const result = await db.from('profiles').select('user_id,display_name,identity_label,bio,avatar_path,website,verified').eq('slug', params.slug || '').eq('is_public', true).maybeSingle();
  if (result.error) return new Response('Profile temporarily unavailable.', { status: 503 });
  if (!result.data) return new Response('Profile not found.', { status: 404 });
  const person = result.data;
  const initials = person.display_name.split(/\s+/).slice(0,2).map((part: string) => part[0]).join('');
  // Only this member's published listings are shown; drafts and in-review records never appear here.
  const owned=await db.from('projects').select('slug').eq('owner_user_id',person.user_id).eq('listing_status','published');
  if(owned.error)return new Response('Projects temporarily unavailable',{status:503});
  const slugs=new Set(owned.data.map(p=>p.slug));
  const list=(await listPublished()).filter(p=>slugs.has(p.slug)).map(projectCard).join('');
  const work = list ? `<section class="profile-work"><h2>Published projects</h2><div class="profile-project-grid">${list}</div></section>` : '';
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(person.display_name)} · TryMyBuild</title><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/feedback.css"><link rel="icon" type="image/svg+xml" href="/assets/brand/trymybuild-favicon.svg"><link rel="apple-touch-icon" sizes="180x180" href="/assets/brand/trymybuild-app-180.png"></head><body><header class="site-header"><a class="brand" href="/">TryMyBuild</a><a href="/dashboard" data-account-nav>My account</a></header><main id="app" class="page-shell"><section class="profile-hero"><span class="person-avatar large">${person.avatar_path ? `<img src="${escape(person.avatar_path)}" alt="">` : escape(initials)}</span><div><p class="eyebrow">TryMyBuild member</p><h1>${escape(person.display_name)}</h1><strong>${escape(person.identity_label)}</strong><p>${escape(person.bio)}</p>${person.website?`<a href="${escape(person.website)}" rel="noopener noreferrer nofollow" target="_blank">Website ↗</a>`:''}${person.verified?'<p>Creator identity reviewed by TryMyBuild</p>':''}</div></section>${work}</main>${publicActions}</body></html>`, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
};
