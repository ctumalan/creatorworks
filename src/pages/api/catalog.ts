import type { APIRoute } from 'astro';
import { json } from '../../server/auth';
import { databaseReady } from '../../server/database';
import { listPublished } from '../../server/catalog-db';

// Public, authoritative catalog feed. no-store so a newly approved listing is discoverable immediately,
// without a rebuild or redeploy. Only published listings are ever returned here.
export const GET: APIRoute = async () => {
  if (!databaseReady()) return json({ connected: false, projects: [] });
  try {
    return json({ connected: true, projects: await listPublished() });
  } catch {
    return json({ connected: false, projects: [], error: 'The catalog is temporarily unavailable.' }, 503);
  }
};
