import type { APIRoute } from 'astro';
import { env, origin, SESSION_COOKIE, workos } from '../../server/auth';
import { sameOrigin } from '../../server/security.mjs';

export const POST: APIRoute = async context => {
  if (!sameOrigin(context.request, origin(context))) return new Response('Forbidden', { status: 403 });
  const data = context.cookies.get(SESSION_COOKIE)?.value;
  context.cookies.delete(SESSION_COOKIE, { path: '/' });
  context.cookies.delete('cw_security_fresh', {path:'/'});
  context.cookies.delete('cw_security_challenge', {path:'/'});
  if (data) {
    try {
      const session = workos().userManagement.loadSealedSession({ sessionData: data, cookiePassword: env('WORKOS_COOKIE_PASSWORD') });
      const logoutUrl = await session.getLogoutUrl({ returnTo: origin(context) });
      return context.redirect(logoutUrl, 303);
    } catch { /* The local cookie is removed even when remote logout is unavailable. */ }
  }
  return context.redirect('/', 303);
};
