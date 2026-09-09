// Keep legacy bookmarks working without moving in-flight OAuth callbacks or API requests.
export function canonicalDestination(requestUrl, method, configuredOrigin) {
  const url = new URL(requestUrl);
  if (configuredOrigin !== 'https://trymybuild.com') return null;
  if (!['GET', 'HEAD'].includes(method)) return null;
  if (!['creatorworks.vercel.app', 'www.trymybuild.com'].includes(url.hostname)) return null;
  if (url.pathname === '/auth/callback' || url.pathname.startsWith('/api/')) return null;
  url.protocol = 'https:';
  url.host = 'trymybuild.com';
  return url.href;
}
