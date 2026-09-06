import type { APIRoute } from 'astro';
import { authReady, authMessage, cookieOptions, env, SESSION_COOKIE, workos } from '../../server/auth';
import { equalState } from '../../server/security.mjs';
import { ensureMember, databaseReady } from '../../server/database';

export const GET: APIRoute = async context => {
  const destination = context.cookies.get('cw_auth_destination')?.value === '/?listing=settings' ? '/?listing=settings' : '/?account=1';
  context.cookies.delete('cw_auth_destination', { path: '/' });
  const expected = context.cookies.get('cw_auth_state')?.value;
  const verifier = context.cookies.get('cw_auth_verifier')?.value;
  context.cookies.delete('cw_auth_state', { path: '/' });
  context.cookies.delete('cw_auth_verifier', { path: '/' });
  if (!authReady()) return authMessage('Sign-in setup is still being connected.');
  const code = context.url.searchParams.get('code');
  if (!code || !verifier || !equalState(context.url.searchParams.get('state'), expected)) {
    return authMessage('This sign-in link has expired. Please return to CreatorWorks and start sign-in again.', 400);
  }
  try {
    const result = await workos().userManagement.authenticateWithCode({
      clientId: env('WORKOS_CLIENT_ID'), code, codeVerifier: verifier,
      session: { sealSession: true, cookiePassword: env('WORKOS_COOKIE_PASSWORD') },
    });
    if (!result.sealedSession) return authMessage('We could not complete sign-in. Please try again.', 502);
    if (databaseReady()) await ensureMember(result.user);
    context.cookies.set(SESSION_COOKIE, result.sealedSession, cookieOptions(context));
    return context.redirect(destination, 303);
  } catch { return authMessage('We could not complete sign-in. Please return to the site and try again.', 502); }
};
