// Supabase-backed adapter for listing-service.mjs, plus the server-side image re-encoder.
import sharp from 'sharp';
import { PROJECT_FIELDS } from './catalog-db';

const BUCKET = 'project-previews';
const isUuid = (v: string) => typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v);

export function projectStore(db: any) {
  return {
    async findOwnedById(ownerId: string, id: string) {
      if (!isUuid(id)) return null;
      const { data } = await db.from('projects').select(PROJECT_FIELDS).eq('id', id).eq('owner_user_id', ownerId).maybeSingle();
      return data || null;
    },
    async findOwnedByToken(ownerId: string, token: string) {
      if (!token) return null;
      const { data } = await db.from('projects').select(PROJECT_FIELDS).eq('owner_user_id', ownerId).eq('client_token', token).maybeSingle();
      return data || null;
    },
    async findOwnedBySlug(ownerId: string, slug: string) {
      const { data } = await db.from('projects').select(PROJECT_FIELDS).eq('owner_user_id', ownerId).eq('slug', slug).maybeSingle();
      return data || null;
    },
    async insertProject(fields: any) {
      const { data, error } = await db.from('projects').insert(fields).select(PROJECT_FIELDS).single();
      if (error) {
        if (error.code === '23505') {
          const m = `${error.message || ''} ${error.details || ''}`.toLowerCase();
          if (m.includes('token')) throw { code: 'DUP_TOKEN' };
          if (m.includes('slug')) throw { code: 'DUP_SLUG' };
        }
        throw error;
      }
      return data;
    },
    // Optimistic, guarded update: succeeds only if status AND lock_version still match what we read.
    async updateOwnedGuarded(id: string, ownerId: string, expected: { status: string; lockVersion: number }, patch: any) {
      const { data, error } = await db.from('projects')
        .update({ ...patch, lock_version: (expected.lockVersion ?? 0) + 1, updated_at: new Date().toISOString() })
        .eq('id', id).eq('owner_user_id', ownerId).eq('listing_status', expected.status).eq('lock_version', expected.lockVersion)
        .select(PROJECT_FIELDS).maybeSingle();
      if (error) throw error;
      return data || null;
    },
    async putImage(key: string, bytes: Buffer, contentType: string) {
      const { error } = await db.storage.from(BUCKET).upload(key, bytes, { contentType, upsert: false });
      if (error) throw error;
    },
    async deleteImage(key: string) {
      await db.storage.from(BUCKET).remove([key]);
    },
  };
}

// Decode and re-encode server-side: bounds dimensions and output size and strips metadata. This is the
// authoritative check — signature bytes alone are not trusted. Throws on anything that is not a real,
// decodable JPEG/PNG/WebP within limits.
export async function reencodeImage(bytes: Buffer) {
  if (!bytes || bytes.length === 0 || bytes.length > 8 * 1024 * 1024) throw new Error('image rejected');
  const meta = await sharp(bytes, { limitInputPixels: 50_000_000 }).metadata();
  if (!['jpeg', 'png', 'webp'].includes(meta.format || '')) throw new Error('unsupported format');
  let out = await sharp(bytes, { limitInputPixels: 50_000_000 }).rotate()
    .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer();
  if (out.length > 3_000_000) {
    out = await sharp(bytes, { limitInputPixels: 50_000_000 }).rotate()
      .resize(1280, 1280, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 68 }).toBuffer();
  }
  // Enforce the output cap after the FINAL attempt — never store an over-limit image.
  if (out.length > 3_000_000) throw new Error('image too large after re-encoding');
  return { bytes: out, contentType: 'image/jpeg' };
}
