import type { APIRoute } from 'astro';
import { authReady, authMessage, cookieOptions, currentUser, env, workos } from '../../server/auth';
import { authChallenge } from '../../server/security.mjs';
import { feedbackDestination } from '../../server/feedback-policy.mjs';
import { signProof } from '../../server/account-security.mjs';

export const GET: APIRoute = async context => {
  if (!authReady()) return authMessage('Account setup is being connected. You can explore every project while we finish.');
  const destination = feedbackDestination(context.url.searchParams.get('next'));
  const user = await currentUser(context);
  const reauth = context.url.searchParams.get('reauth') === '1' && destination === '/dashboard/security';
  if (user && !reauth) return context.redirect(destination, 302);
  context.cookies.delete('cw_security_fresh', {path:'/'});
  context.cookies.delete('cw_security_challenge', {path:'/'});
  if (user && reauth) context.cookies.set('cw_security_challenge', signProof(user.id,'challenge',env('WORKOS_COOKIE_PASSWORD')), {...cookieOptions(context),maxAge:300});
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
