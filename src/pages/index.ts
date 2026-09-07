import type { APIRoute } from 'astro';
import template from '../../index.html?raw';

export const GET: APIRoute = context => {
  if (context.url.searchParams.get('edit') === 'profile') return context.redirect('/dashboard/profile', 302);
  if (context.url.searchParams.has('account') && context.url.searchParams.get('edit') !== 'profile') return context.redirect('/dashboard', 302);
  return new Response(template.replace('<script src="app.js">', '<script>window.CW_SERVER = true;</script><script src="/app.js">'), {
  headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
});
};
