import type {APIRoute} from 'astro';
import {memberContext} from '../../server/workspace';
import {origin,json} from '../../server/auth';
import {sameOrigin} from '../../server/security.mjs';
import {validId} from '../../server/feedback-policy.mjs';
import {allowRequest} from '../../server/abuse';
import {publicProfile} from '../../server/public-profile';
import {directThread} from '../../server/direct-messages';
export const POST:APIRoute=async context=>{
 if(!sameOrigin(context.request,origin(context)))return json({error:'Request not allowed.'},403);
 try{const m=await memberContext(context);if(!m||!m.user.emailVerified)return json({error:'Sign in with a verified email to send messages.'},401);
  if(!await allowRequest(m.user.id,'direct-messages',30,60))return json({error:'Please wait before trying again.'},429);
  const raw=await context.request.text();if(raw.length>16000)return json({error:'Message too long.'},413);const f=Object.fromEntries(new URLSearchParams(raw));
  const thread=validId(f.thread)?await directThread(m.db,m.member.id,f.thread):null;
  const other=thread?(thread.member_a===m.member.id?thread.member_b:thread.member_a):'';
  if(f.action==='send'){
   if(!validId(f.requestId)||!f.message?.trim()||f.message.trim().length>2000)return json({error:'Write a message of 1–2000 characters.'},400);
   if(f.thread&&!thread)return json({error:'Conversation unavailable.'},404);
   const recipient=other||(await publicProfile(m.db,f.recipient||''))?.user_id;if(!recipient||recipient===m.member.id)return json({error:'Choose another public creator.'},400);
   if(!await allowRequest(m.user.id,'direct-send',20,3600))return json({error:'Please wait before sending more messages.'},429);
   const r=await m.db.rpc('cw_send_direct_message',{p_actor:m.member.id,p_recipient:recipient,p_request:f.requestId,p_message:f.message.trim()});if(r.error)return json({error:'Message not confirmed. The recipient may be unavailable or messaging may be blocked. Your text is still here.'},409);
   return json({saved:true,href:'/dashboard/messages?direct='+r.data,message:'Private message sent.'});
  }
  if(!thread)return json({error:'Conversation unavailable.'},404);let result;
  if(f.action==='read'){
   const seen=new Date(f.seenThrough);if(!Number.isFinite(seen.getTime())||seen.getTime()>Date.now()+1000)return json({error:'Invalid read time.'},400);
   result=await m.db.rpc('cw_mark_direct_read',{p_user:m.member.id,p_thread:thread.id,p_seen:seen.toISOString()});
   if(result.error)throw result.error;return json({saved:true});
  }else if(['block','unblock'].includes(f.action))result=await m.db.rpc('cw_direct_block',{p_actor:m.member.id,p_other:other,p_block:f.action==='block'});
  else if(f.action==='report'){
   if(!validId(f.requestId)||!f.reason||f.reason.trim().length<10||f.reason.length>1000)return json({error:'Explain the report in 10–1000 characters.'},400);
   result=await m.db.from('support_cases').upsert({id:f.requestId,user_id:m.member.id,kind:'report',subject:'Private message report',message:'Private conversation '+thread.id+'\n'+f.reason.trim()},{onConflict:'id',ignoreDuplicates:true});
  }else return json({error:'Unknown action.'},400);
  if(result.error)throw result.error;return context.redirect('/dashboard/messages?direct='+thread.id+'&saved=1',303);
 }catch{return json({error:'Unable to confirm this action. Please retry.'},503);}
};
