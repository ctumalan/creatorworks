import { defineMiddleware } from 'astro:middleware';
import { canonicalDestination } from './server/canonical-domain.mjs';
export const onRequest = defineMiddleware(async (context, next) => {
  const destination = canonicalDestination(context.url.href, context.request.method, process.env.PUBLIC_APP_URL || import.meta.env.PUBLIC_APP_URL || '');
  if (destination) return context.redirect(destination, 307);
  const response = await next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return response;
});
