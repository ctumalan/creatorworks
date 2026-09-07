import type { APIRoute } from 'astro';
import { authReady, json } from '../../server/auth';
import { databaseReady } from '../../server/database';
export const GET: APIRoute = () => json({ service: 'TryMyBuild', authenticationConfigured: authReady(), databaseConfigured: databaseReady() });
