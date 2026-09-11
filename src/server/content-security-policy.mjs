// No inline scripts, eval, third-party fonts, plugins, or framing of TryMyBuild pages.
// Existing style attributes are allowed independently of the stricter script policy.
export const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' https://www.googletagmanager.com",
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
  "frame-src https://www.youtube-nocookie.com https://player.vimeo.com https://www.loom.com",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'"
].join('; ');
