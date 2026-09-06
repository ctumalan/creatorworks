import type { APIRoute } from 'astro';
import { authReady, authMessage, cookieOptions, currentUser, env, workos } from '../../server/auth';
import { authChallenge } from '../../server/security.mjs';

export const GET: APIRoute = async context => {
  if (!authReady()) return authMessage('Account setup is being connected. You can explore every project while we finish.');
  const destination = context.url.searchParams.get('next') === 'listing' ? '/?listing=settings' : '/?account=1';
  if (await currentUser(context)) return context.redirect(destination, 302);
  context.cookies.set('cw_auth_destination', destination, { ...cookieOptions(context), maxAge: 600 });
  const { state, verifier, challenge } = authChallenge();
  context.cookies.set('cw_auth_state', state, { ...cookieOptions(context), maxAge: 600 });
  context.cookies.set('cw_auth_verifier', verifier, { ...cookieOptions(context), maxAge: 600 });
  const url = workos().userManagement.getAuthorizationUrl({
    provider: 'authkit', clientId: env('WORKOS_CLIENT_ID'), redirectUri: env('WORKOS_REDIRECT_URI'),
    state, codeChallenge: challenge, codeChallengeMethod: 'S256',
    prompt: 'login',
    screenHint: context.url.searchParams.get('signup') === '1' ? 'sign-up' : 'sign-in',
  });
  return context.redirect(url, 302);
};
