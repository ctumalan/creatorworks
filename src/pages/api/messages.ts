import type {APIRoute} from 'astro';
import {memberContext} from '../../server/workspace';
import {origin,json} from '../../server/auth';
import {sameOrigin} from '../../server/security.mjs';
import {validId,threadAccess} from '../../server/feedback-policy.mjs';
import {allowRequest} from '../../server/abuse';
export const POST:APIRoute=async context=>{
 if(!sameOrigin(context.request,origin(context)))return json({error:'Forbidden'},403);
 let id='',action='';
 try{
  const m=await memberContext(context);if(!m||!m.user.emailVerified)return json({error:'Sign in with a verified email'},401);
  if(!await allowRequest(m.user.id,'messages',30))return json({error:'Please wait before trying again'},429);
  const raw=await context.request.text();if(raw.length>6000)return json({error:'Too large'},413);
  const f=Object.fromEntries(new URLSearchParams(raw));if(!validId(f.id))return json({error:'Invalid conversation'},400);id=f.id;action=f.action;
  const item=await m.db.from('creator_feedback').select('author_user_id,project_slug').eq('id',id).maybeSingle();if(item.error)throw item.error;
  const project=item.data?await m.db.from('projects').select('owner_user_id').eq('slug',item.data.project_slug).maybeSingle():{data:null,error:null};if(project.error)throw project.error;
  if(!item.data||!project.data||!threadAccess(m.member.id,item.data.author_user_id,project.data.owner_user_id))return json({error:'Conversation not found'},404);
  let result;
  if(action==='read'){
   const seen=new Date(f.seenThrough);if(!Number.isFinite(seen.getTime())||seen.getTime()>Date.now()+1000)return json({error:'Invalid read time'},400);
   result=await m.db.rpc('cw_mark_feedback_read',{p_user:m.member.id,p_feedback:id,p_seen:seen.toISOString()});
   return json({saved:!result.error},result.error?503:200);
  }else if(action==='rate'){
   if(m.member.id!==project.data.owner_user_id||!['5','10'].includes(f.total)||!/^\d{1,9}$/.test(f.revision)||String(f.reason||'').trim().length<10||f.reason.length>300)return json({error:'Invalid recognition'},400);
   result=await m.db.rpc('cw_rate_feedback',{p_actor:m.member.id,p_feedback:id,p_total:Number(f.total),p_reason:f.reason.trim(),p_revision:Number(f.revision)});
  }else if(action==='report'){
   if(!validId(f.requestId)||String(f.reason||'').trim().length<10||f.reason.length>1000)return json({error:'Explain the report in 10–1000 characters'},400);
   if(f.reply){if(!validId(f.reply))return json({error:'Invalid reply'},400);const reply=await m.db.from('feedback_replies').select('id').eq('id',f.reply).eq('feedback_id',id).maybeSingle();if(reply.error)throw reply.error;if(!reply.data)return json({error:'Reply not found'},404);}
   result=await m.db.from('support_cases').upsert({id:f.requestId,user_id:m.member.id,kind:'report',subject:'Feedback report',message:`Conversation ${id}${f.reply?' · Reply '+f.reply:''}\n${f.reason.trim()}`,project_slug:item.data.project_slug},{onConflict:'id',ignoreDuplicates:true});
  }else return json({error:'Unknown action'},400);
  if(result.error)throw result.error;
  return context.redirect('/dashboard/messages?thread='+id+'&saved=1',303);
 }catch{return action==='read'?json({error:'Unable to mark as read'},503):context.redirect('/dashboard/messages?'+(id?'thread='+id+'&':'')+'error='+(action==='rate'?'rating':'save'),303);}
};
