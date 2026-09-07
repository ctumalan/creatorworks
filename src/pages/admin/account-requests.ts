import type { APIRoute } from 'astro';
import { adminUser } from '../../server/admin';
import { database } from '../../server/database';
import { surface, e, pageNumber, pages } from '../../server/feedback-ui';
export const GET:APIRoute=async context=>{
 if(!await adminUser(context))return surface('Access required','<h1>Administrator access required.</h1>','',403);
 try {
  const page=pageNumber(context.url.searchParams.get('page')),db=database();
  const r=await db.from('account_deletion_requests').select('id,user_id,requested_at',{count:'exact'}).eq('status','pending').order('requested_at').order('id').range(page*25,page*25+24);
  if(r.error)throw r.error;
  const ids=r.data.map(item=>item.user_id);
  const profiles=ids.length?await db.from('profiles').select('user_id,display_name').in('user_id',ids):{data:[],error:null};
  if(profiles.error)throw profiles.error;
  return surface('Account deletion requests',`<header><h1>Account deletion requests</h1></header><p><a href="/admin">Back to administration</a></p><p>These are requests, not permission to erase records automatically. Agree on the treatment of projects, images, and shared conversations with the account holder before any irreversible action. This screen does not execute deletion or mark it complete.</p>${r.data.length?r.data.map(row=>`<article class="cw-panel"><h2>${e(profiles.data?.find(p=>p.user_id===row.user_id)?.display_name||'Member')}</h2><p>Requested ${e(new Date(row.requested_at).toLocaleString('en-US',{timeZone:'America/Los_Angeles'}))} Pacific</p><p class="cw-meta">Member reference: ${e(row.user_id)}</p><a href="/admin?section=people">View account directory</a></article>`).join(''):'<p class="cw-panel">No pending requests.</p>'}${pages('/admin/account-requests',page,r.count||0)}`,'security',200,true);
 }catch{return surface('Account deletion requests','<h1>Account deletion requests</h1><p>Requests could not be loaded. Confirm account-security setup is complete, then retry.</p><a href="/admin">Back to administration</a>','security',503,true);}
};
