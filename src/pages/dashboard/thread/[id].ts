import type { APIRoute } from 'astro';
import { randomUUID } from 'node:crypto';
import { currentUser } from '../../../server/auth';
import { database, ensureMember } from '../../../server/database';
import { surface, signIn, unavailable, e, feedbackCard, pageNumber, pages } from '../../../server/feedback-ui';
import { validId, threadAccess } from '../../../server/feedback-policy.mjs';
export const GET:APIRoute=async context=>{
 const user=await currentUser(context);if(!user)return signIn('/dashboard');
 if(!validId(context.params.id))return surface('Not found','<h1>Conversation not found.</h1>','',404);
 try{
  const member=await ensureMember(user),db=database();
  const item=await db.from('creator_feedback').select('*').eq('id',context.params.id!).maybeSingle();
  if(item.error)throw item.error;
  const project=item.data?await db.from('projects').select('title,owner_user_id').eq('slug',item.data.project_slug).maybeSingle():{data:null,error:null};
  if(project.error)throw project.error;
  if(!item.data||!project.data||!threadAccess(member.id,item.data.author_user_id,project.data.owner_user_id))return surface('Not found','<h1>Conversation not found.</h1>','',404);
  const ownerId=project.data.owner_user_id;
  const page=pageNumber(context.url.searchParams.get('page'));
  const replies=await db.from('feedback_replies').select('id,author_user_id,message,created_at',{count:'exact'}).eq('feedback_id',item.data.id).order('created_at').order('id').range(page*25,page*25+24);
  if(replies.error)throw replies.error;
  const profiles=await db.from('profiles').select('user_id,display_name').in('user_id',[item.data.author_user_id,project.data.owner_user_id].filter(Boolean));
  if(profiles.error)throw profiles.error;
  const name=(id:string)=>profiles.data.find(p=>p.user_id===id)?.display_name||'Member';
  return surface(project.data.title,`<a href="/dashboard${member.id===project.data.owner_user_id?'?view=creator':''}">← My dashboard</a><h1>${e(project.data.title)}</h1>${context.url.searchParams.has('sent')?'<p class="cw-notice" role="status">Sent. Your feedback is saved in this conversation.</p>':''}${context.url.searchParams.has('error')?'<p class="cw-notice" role="alert">Your reply was not saved. Please wait a moment and try again.</p>':''}${feedbackCard(item.data,project.data.title,name(item.data.author_user_id),false)}<section class="cw-panel"><h2>Keep the conversation going</h2><p class="cw-meta">Replies stay between you and the creator—even when the original feedback is public. Administrators may access records for safety and support. Check back here for replies; email notifications aren’t enabled.</p>${replies.data.length?replies.data.map(r=>`<article class="cw-reply"><strong>${e(name(r.author_user_id))}${r.author_user_id===ownerId?' · Creator':''}</strong><p class="cw-message">${e(r.message)}</p><span class="cw-meta">${e(new Date(r.created_at).toLocaleDateString('en-US'))}</span></article>`).join(''):'<p>No replies yet.</p>'}${pages(`/dashboard/thread/${item.data.id}?replies=1`,page,replies.count||0)}<form action="/api/feedback-reply" method="post"><input type="hidden" name="id" value="${e(item.data.id)}"><input type="hidden" name="requestId" value="${randomUUID()}"><label for="reply">Your reply</label><textarea name="message" id="reply" required maxlength="800" placeholder="Ask a question, say thanks, or share what changed…"></textarea><button class="primary-button" type="submit">Send reply</button></form></section>`,'visitor');
 }catch{return unavailable();}
};
