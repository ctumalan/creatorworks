import { createClient } from '@supabase/supabase-js';
import { env } from './auth';

export function databaseReady() { return !!(env('SUPABASE_URL') && env('SUPABASE_SERVICE_ROLE_KEY')); }
export function database() {
  return createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false, autoRefreshToken: false } });
}
export async function ensureMember(user: { id: string; firstName?: string | null; lastName?: string | null }) {
  const db = database();
  const { data: existing, error: readError } = await db.from('users').select('id,system_role,account_status').eq('workos_user_id', user.id).maybeSingle();
  if (readError) throw new Error('Account lookup unavailable');
  let member = existing;
  if (!member) {
    const { data, error } = await db.from('users').upsert({ workos_user_id: user.id }, { onConflict: 'workos_user_id', ignoreDuplicates: true }).select('id,system_role,account_status').maybeSingle();
    if (error) throw new Error('Account creation unavailable');
    member = data;
    if (!member) {
      const retry = await db.from('users').select('id,system_role,account_status').eq('workos_user_id', user.id).single();
      if (retry.error) throw new Error('Account lookup unavailable');
      member = retry.data;
    }
  }
  if (member.account_status !== 'active') throw new Error('Account access is restricted');
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ').slice(0, 60) || 'New member';
  const { error } = await db.from('profiles').upsert({ user_id: member.id, slug: `member-${member.id}`, display_name: displayName }, { onConflict: 'user_id', ignoreDuplicates: true });
  if (error) throw new Error('Profile creation unavailable');
  return member;
}
