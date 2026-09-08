// Authoritative project reads. The public catalog, detail views, "Tell the creator" pages, saved
// items, and dashboards all resolve project content through here so a newly published listing appears
// everywhere without a rebuild or redeploy.
import { database } from './database';

const STUDIO = {
  slug: 'creatorworks-studio',
  name: 'TryMyBuild Studio',
  initials: 'TMB',
  label: 'In-house creator · Founded by Christian Tumalán',
  bio: 'Our launch collection of practical tools, built in-house at TryMyBuild.',
  verified: true,
};
const studioNote = 'Founder-confirmed: Christian Tumalán confirmed control of TryMyBuild Studio and its listed projects on September 4, 2026. This is not independent verification or a guarantee of product quality.';

const initialsOf = (name: string) => String(name || 'Member').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'M';

export const PROJECT_FIELDS =
  'video_url,lock_version,id,slug,owner_user_id,title,category,summary,tagline,headline,help_text,first_try,purpose,audience,stage,price_label,is_free,external_url,link_note,outcome,note,preview_path,preview_public_url,benefits,access_note,creator_slug,is_studio,listing_status,ownership_status,submitted_at,published_at,updated_at,created_at';
const PUBLIC_CATALOG_FIELDS = `${PROJECT_FIELDS},saved_projects(count)`;

// Resolve the public attribution for a set of project rows in one query (studio rows need no lookup).
async function attributions(db: any, rows: any[]) {
  const ownerIds = [...new Set(rows.filter(r => !r.is_studio && r.owner_user_id).map(r => r.owner_user_id))];
  const profiles = ownerIds.length
    ? (await db.from('profiles').select('user_id,slug,display_name,identity_label,is_public,avatar_path,verified').in('user_id', ownerIds)).data || []
    : [];
  const byUser = new Map(profiles.map((p: any) => [p.user_id, p]));
  return (row: any) => {
    if (row.is_studio || !row.owner_user_id) return { ...STUDIO, verificationNote: studioNote };
    const p: any = byUser.get(row.owner_user_id);
    if (!p) return { slug: '', name: 'A TryMyBuild creator', initials: 'C', label: 'TryMyBuild creator', bio: '', verified: false };
    return {
      slug: p.is_public ? p.slug : '',
      name: p.display_name,
      avatar: p.avatar_path || '',
      initials: initialsOf(p.display_name),
      label: p.identity_label || 'TryMyBuild creator',
      bio: '',
      verified: p.verified === true,
      verificationNote: p.verified ? 'Creator identity reviewed by TryMyBuild. This is not a guarantee of product quality.' : '',
    };
  };
}

export function toClientProject(row: any, attributedBy: (row: any) => any, index = 0) {
  const benefits = Array.isArray(row.benefits) ? row.benefits : [];
  const savedAggregate = Array.isArray(row.saved_projects) ? row.saved_projects[0] : row.saved_projects;
  const saveCount = Math.max(0, Number(savedAggregate?.count) || 0);
  // Display-only rebrand of platform-authored launch notes; keep stored data and user copy intact.
  const studioCopy = (value: string) => row.is_studio
    ? value.replace(/\bCreator(?:\s+|-)?Works\b/g, 'TryMyBuild')
    : value;
  return {
    slug: row.slug,
    video: row.video_url || '',
    name: row.title,
    category: row.category || 'Utilities',
    summary: row.summary || row.headline || '',
    purpose: row.purpose || '',
    audience: row.audience || '',
    stage: row.stage || 'New',
    price: row.price_label || 'Free',
    isFree: row.is_free !== false,
    url: row.external_url || '',
    linkNote: studioCopy(row.link_note || ''),
    outcome: row.outcome || '',
    note: studioCopy(row.note || ''),
    preview: row.preview_public_url || row.preview_path || `/assets/previews/${row.slug}.png`,
    benefits,
    accessNote: studioCopy(row.access_note || 'Opens a separate site; sign-in may be required'),
    presentation: {
      eyebrow: row.tagline || row.category || '',
      headline: row.headline || row.summary || row.title,
      help: row.help_text || '',
      firstTry: row.first_try || '',
    },
    ownershipStatus: row.ownership_status || 'unverified',
    creator: attributedBy(row),
    recentOrder: 1000 - index,
    reviewCount: 0,
    saveCount,
  };
}

// Every published listing, newest first — the public catalog source.
export async function listPublished() {
  const db = database();
  const { data, error } = await db.from('projects').select(PUBLIC_CATALOG_FIELDS)
    .eq('listing_status', 'published').order('published_at', { ascending: false }).order('updated_at', { ascending: false }).limit(500);
  if (error) throw error;
  const attributedBy = await attributions(db, data || []);
  return (data || []).map((row: any, i: number) => toClientProject(row, attributedBy, i));
}

// One published listing by slug, or null. Used for shareable /?project=slug and detail hydration.
export async function getPublishedProject(slug: string) {
  const db = database();
  const { data, error } = await db.from('projects').select(PUBLIC_CATALOG_FIELDS).eq('slug', slug).eq('listing_status', 'published').maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const attributedBy = await attributions(db, [data]);
  return toClientProject(data, attributedBy);
}

// The raw project row for a slug (any status), for ownership-aware server logic.
export async function getProjectRow(slug: string) {
  const { data, error } = await database().from('projects').select(PROJECT_FIELDS).eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data;
}

// All projects owned by a member (drafts, in-review, published, unpublished) for "My projects".
export async function listOwnedProjects(ownerId: string) {
  const { data, error } = await database().from('projects').select(PROJECT_FIELDS)
    .eq('owner_user_id', ownerId).order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export { STUDIO, studioNote };
