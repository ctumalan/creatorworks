import assert from 'node:assert/strict';
const base = process.argv[2] || 'http://127.0.0.1:4322';
const page = await fetch(base);
assert.equal(page.status, 200);
assert.match(await page.text(), /window.CW_SERVER = true/);
for (const route of ['/app.js', '/styles.css', '/api/health', '/api/me', '/projects/afterschool-together/index.html']) {
  const response = await fetch(base + route);
  assert.equal(response.status, 200, route);
}
for (const route of ['/IDENTITY_ARCHITECTURE.md', '/.env.local', '/CLAUDE_CORRECTIONS_PROMPT.txt']) {
  const response = await fetch(base + route);
  assert.equal(response.status, 404, route);
}
for (const route of ['/api/me', '/auth/sign-out']) {
  const response = await fetch(base + route, { method: 'POST', headers: { origin: 'https://foreign.example', 'Content-Type': 'application/json' }, body: '{}', redirect: 'manual' });
  assert.equal(response.status, 403, route);
}
const health = await (await fetch(base + '/api/health')).json();
console.log(JSON.stringify({ publicSite: 'PASS', privateFiles: 'not served', crossOriginWrites: 'rejected', ...health }));
