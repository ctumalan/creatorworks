// Credentials enter through stdin, never command arguments or console output.
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const project = JSON.parse(readFileSync(new URL('../.vercel/project.json', import.meta.url), 'utf8'));
if (project.projectId !== 'prj_juKQHNOZiMyxCIufITAvivwQ50vm') throw new Error('CreatorWorks project identity mismatch');
const mode = process.argv[2];
let name;
let value;
if (mode === 'workos') {
  const source = readFileSync(0, 'utf8');
  if (!source.includes('client_01M1Q45PBXXP060946GCNPSJDP')) throw new Error('Expected CreatorWorks client ID was not present');
  const match = source.match(/WORKOS_API_KEY\s*=\s*["']?(sk_[A-Za-z0-9_-]+)/);
  if (!match) throw new Error('No complete WorkOS credential supplied');
  name = 'WORKOS_API_KEY'; value = match[1];
} else if (mode === 'database') {
  value = readFileSync(0, 'utf8').trim();
  if (!/^(sb_secret_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9_.-]+)$/.test(value) || value.length < 35) throw new Error('No valid database server credential supplied');
  if (value.startsWith('eyJ')) {
    const payload = JSON.parse(Buffer.from(value.split('.')[1], 'base64url').toString());
    if (payload.ref !== 'nkrkmfszuntvzjonrznb' || payload.role !== 'service_role') throw new Error('Not the CreatorWorks service credential');
  }
  name = 'SUPABASE_SERVICE_ROLE_KEY';
} else if (mode === 'cookie') {
  name = 'WORKOS_COOKIE_PASSWORD'; value = randomBytes(48).toString('base64url');
} else throw new Error('Unknown credential mode');
const result = spawnSync('vercel', ['env', 'add', name, 'production', '--sensitive', '--yes', '--project', 'creatorworks', '--scope', 'christian-s-team3'], { input: value, encoding: 'utf8' });
// Deliberately do not relay provider output, which could include input details.
if (result.status !== 0) { console.error(`Could not install ${name}; check variable names in Vercel before retrying.`); process.exit(1); }
console.log(`${name} installed in the CreatorWorks project.`);
