import type { APIRoute } from 'astro';
import { adminUser } from '../../../server/admin';
import { origin,json } from '../../../server/auth';
import { database,ensureMember } from '../../../server/database';
import { sameOrigin } from '../../../server/security.mjs';
import { validId } from '../../../server/feedback-policy.mjs';
export const POST:APIRoute=async context=>{
 if(!sameOrigin(context.request,origin(context)))return json({error:'Request not allowed.'},403);
 const user=await adminUser(context);if(!user)return json({error:'Administrator access required.'},403);
 try{
  const raw=await context.request.text();if(raw.length>12000)return json({error:'Request too large.'},413);
  const body=Object.fromEntries(new URLSearchParams(raw));
  if(!validId(body.id)||!['pending','published','hidden'].includes(body.previous)||!['pending','published','hidden'].includes(body.status)||body.confirm!=='yes'||!body.reason||body.reason.trim().length<3||body.reason.length>300)return json({error:'Confirm a valid decision and reason.'},400);
  const member=await ensureMember(user);
  const result=await database().rpc('cw_review_feedback',{p_actor:member.id,p_id:body.id,p_previous:body.previous,p_status:body.status,p_reason:body.reason.trim()});
  if(result.error)throw result.error;
  return context.redirect('/admin/feedback?notice=saved',303);
 }catch{return context.redirect('/admin/feedback?notice=retry',303);}
};
