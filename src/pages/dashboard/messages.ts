import type {APIRoute} from 'astro';
import {memberContext,workspace} from '../../server/workspace';
import {e,signIn,unavailable,pageNumber} from '../../server/feedback-ui';
import {validId} from '../../server/feedback-policy.mjs';
import {conversation} from '../../server/conversation';
export const GET:APIRoute=async context=>{
 try{
  const m=await memberContext(context);if(!m)return signIn('/dashboard/messages');
  const project=(context.url.searchParams.get('project')||'').slice(0,80),unread=context.url.searchParams.get('unread')==='1',page=pageNumber(context.url.searchParams.get('inboxPage')),id=context.url.searchParams.get('thread');
  const result=await m.db.rpc('cw_message_inbox',{p_user:m.member.id,p_project:project,p_unread:unread,p_page:page});if(result.error)throw result.error;
  const rows=result.data||[];
  const selected=id&&validId(id)?await conversation(m.db,m.member.id,id,context.url):null;
  const params=new URLSearchParams({project,...(unread?{unread:'1'}:{})});
  const filter=`<form method="get" class="cw-panel cw-message-tools"><label>Find a project<input name="project" value="${e(project)}" maxlength="80" placeholder="Project name"></label><label class="cw-choice"><input type="checkbox" name="unread" value="1" ${unread?'checked':''}>Unread only</label><button class="secondary-button">Filter messages</button><a href="/dashboard/messages">Clear filters</a></form>`;
  const error=context.url.searchParams.get('error');
  const notice=error?`<p class="cw-notice" role="alert">${error==='rating'?'Recognition was not saved. Check the bonus limits, qualification status, and reload before retrying.':'That action was not saved. Check your entry and try again.'}</p>`:context.url.searchParams.has('saved')||context.url.searchParams.has('sent')?'<p class="cw-notice" role="status">Saved successfully.</p>':'';
  return workspace('Messages',`<p>All your project conversations, as a creator and a reviewer, in one place.</p>${notice}${filter}<div class="cw-messages"><aside class="cw-panel cw-message-list" aria-label="Conversations">${rows.map((r:any)=>`<a href="/dashboard/messages?${e(params.toString())}&amp;thread=${e(r.id)}" ${r.id===id?'aria-current="page"':''}><strong>${r.unread?'● ':''}${e(r.title)}</strong><small>${r.unread?'Unread · ':''}${e(r.counterpart)}</small><span>${e(r.last_message.slice(0,100))}</span><small>${e(new Date(r.last_at).toLocaleDateString('en-US'))}</small></a>`).join('')||'<p>No conversations match these filters.</p>'}<nav aria-label="Inbox pages">${page?`<a href="?${e(params.toString())}&amp;inboxPage=${page-1}">Previous conversations</a>`:''}${rows.length===25&&Number(rows[0]?.total_count)>(page+1)*25?`<a href="?${e(params.toString())}&amp;inboxPage=${page+1}">More conversations</a>`:''}</nav></aside><div>${selected||(id?'<p>Conversation not found or no longer available to this account.</p>':'<p class="cw-panel">Choose a conversation to read and reply here.</p>')}</div></div>`,'messages',m.admin);
 }catch{return unavailable();}
};
