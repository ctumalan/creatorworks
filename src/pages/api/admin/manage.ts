import {notificationKey} from '../../../server/notifications';
import type { APIRoute } from 'astro';
import { memberContext } from '../../../server/workspace';
import { origin,env,workos } from '../../../server/auth';
import { sameOrigin } from '../../../server/security.mjs';
import { validProof } from '../../../server/account-security.mjs';
import { allowRequest } from '../../../server/abuse';
export const POST:APIRoute=async context=>{
 if(!sameOrigin(context.request,origin(context)))return new Response('Forbidden',{status:403});let tab='overview',caseId='';
 const back=(ok:boolean)=>context.redirect(`/admin/workspace?tab=${tab}&${ok?'saved':'error'}=1${caseId?'&case='+caseId:''}`,303);
 try{
  const m=await memberContext(context);if(!m?.admin||!m.user.emailVerified)return new Response('Forbidden',{status:403});
  if(!await allowRequest(m.user.id,'admin-manage',20))return new Response('Please wait',{status:429});
  const raw=await context.request.text();if(raw.length>20000)return new Response('Too large',{status:413});const f=Object.fromEntries(new URLSearchParams(raw));if(['people','cases','privacy'].includes(f.tab))tab=f.tab;
  if(!/^[0-9a-f-]{36}$/.test(f.id))return back(false);const {db,member}=m;let r;
  if(f.action==='transfer'){
   if(f.confirm!=='yes'||! /^[0-9a-f-]{36}$/.test(f.owner)||! /^\d{1,9}$/.test(f.version))return back(false);
   r=await db.rpc('cw_transfer_project',{p_actor:member.id,p_project:f.id,p_owner:f.owner,p_version:Number(f.version),p_founder:env('FOUNDER_WORKOS_USER_ID'),p_reason:f.reason});
  }else if(f.action==='member'){
   if(f.confirm!=='yes')return back(false);
   r=await db.rpc('cw_manage_member',{p_actor:member.id,p_target:f.id,p_founder:env('FOUNDER_WORKOS_USER_ID'),p_action:f.decision,p_expected:f.expected,p_reason:f.reason});
  }else if(f.action==='reply'){
   if(!/^[0-9a-f-]{36}$/.test(f.request)||!/^\d{1,9}$/.test(f.revision))return back(false);caseId=f.id;
   r=await db.rpc('cw_case_reply',{p_actor:member.id,p_case:f.id,p_request:f.request,p_message:f.message,p_staff:true,p_founder:env('FOUNDER_WORKOS_USER_ID'),p_revision:Number(f.revision),p_status:f.status});
  }else if(f.action==='erase'){
   if(f.confirmation!=='DELETE'||!validProof(context.cookies.get('cw_security_fresh')?.value,m.user.id,'fresh',env('WORKOS_COOKIE_PASSWORD')))return back(false);
   r=await db.rpc('cw_erase_account',{p_actor:member.id,p_user:f.id,p_founder:env('FOUNDER_WORKOS_USER_ID')});if(r.error)return back(false);
   const prefs=await db.from('site_settings').delete().eq('key',notificationKey(f.id));if(prefs.error)throw prefs.error;
   const job=await db.from('erasure_jobs').select('*').eq('user_id',f.id).single();if(job.error)throw job.error;
   if(job.data.status!=='complete'){
    if(job.data.paths.length){const removed=await db.storage.from('project-previews').remove(job.data.paths);if(removed.error)throw removed.error;}
    try{await workos().userManagement.deleteUser(job.data.workos_id);}catch(err:any){if(err.status!==404&&err.statusCode!==404)throw err;}
    r=await db.from('erasure_jobs').update({status:'complete',workos_id:'',paths:[],completed_at:new Date().toISOString()}).eq('user_id',f.id);if(r.error)throw r.error;
   }
   r=await db.from('account_deletion_requests').update({status:'complete',updated_at:new Date().toISOString()}).eq('user_id',f.id);
  }else return back(false);
  return back(!r?.error);
 }catch{return back(false);}
};
