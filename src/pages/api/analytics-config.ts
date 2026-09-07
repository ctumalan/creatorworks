import type { APIRoute } from 'astro';
import { env, json } from '../../server/auth';
export const GET: APIRoute = () => {
 const id = env('GOOGLE_ANALYTICS_MEASUREMENT_ID');
 return json({measurementId: /^G-[A-Z0-9]+$/.test(id) ? id : ''});
};
