import type {APIRoute} from 'astro';
import {memberContext,workspace} from '../../server/workspace';
import {e,signIn,unavailable,pageNumber} from '../../server/feedback-ui';
import {validId} from '../../server/feedback-policy.mjs';
import {conversation} from '../../server/conversation';
export const GET:APIRoute=async context=>{
 try{const m=await memberContext(context);if(!m)return signIn('/dashboard/messages');
  const project=(context.url.searchParams.get('project')||'').slice(0,80),unread=context.url.searchParams.get('unread')==='1',page=pageNumber(context.url.searchParams.get('inboxPage')),id=context.url.searchParams.get('thread'),sort=['oldest','project'].includes(context.url.searchParams.get('sort')||'')?context.url.searchParams.get('sort')!:'newest';
  const result=await m.db.rpc('cw_workspace_inbox',{p_user:m.member.id,p_project:project,p_unread:unread,p_page:page,p_sort:sort});if(result.error)throw result.error;
  const rows=result.data||[],params=new URLSearchParams({project,sort,...(unread?{unread:'1'}:{})});
  const selected=id&&validId(id)?await conversation(m.db,m.member.id,id,context.url):null;
  const filter=`<form class="cw-message-toolbar" method="get"><label>Find a project<input name="project" value="${e(project)}" placeholder="Project name" maxlength="80"></label><label>Show<select name="unread"><option value="0">All messages</option><option value="1" ${unread?'selected':''}>Unread only</option></select></label><label>Sort<select name="sort">${[['newest','Newest first'],['oldest','Oldest first'],['project','Project name']].map(([v,l])=>`<option value="${v}" ${sort===v?'selected':''}>${l}</option>`).join('')}</select></label><button class="secondary-button">Apply</button><a href="/dashboard/messages">Reset</a></form>`;
  const item=(r:any,body='')=>`<details class="message-item" data-conversation="${e(r.id)}" ${body?'open':''}><summary><strong>${e(r.title)}</strong><small>${r.unread?'● Unread · ':''}${e(new Date(r.last_at).toLocaleDateString('en-US'))}</small><small>${e(r.counterpart)}</small><p>${e(r.last_message.slice(0,140))}</p></summary><div class="message-body" ${body?'data-loaded="true"':''}>${body}</div></details>`;
  let contents=rows.map((r:any)=>item(r,r.id===id?selected||'':'')).join('');
  if(selected&&!rows.some((r:any)=>r.id===id))contents=`<details class="message-item" data-conversation="${e(id)}" open><summary><strong>Selected conversation</strong></summary><div class="message-body" data-loaded="true">${selected}</div></details>`+contents;
  const notice=context.url.searchParams.has('error')?'<p class="cw-notice" role="alert">That action was not saved. Reload the conversation and try again.</p>':context.url.searchParams.has('sent')||context.url.searchParams.has('saved')?'<p class="cw-notice" role="status">Saved successfully.</p>':'';
  return workspace('Messages',`${filter}${notice}${id&&!selected?'<p class="cw-notice">That conversation is unavailable to this account.</p>':''}<div class="message-stream">${contents||'<p class="cw-panel">No conversations match these filters. Your project conversations and replies will appear here.</p>'}</div><nav class="cw-row" aria-label="Inbox pages">${page?`<a href="?${e(params.toString())}&amp;inboxPage=${page-1}">Previous</a>`:''}${rows.length===25&&Number(rows[0]?.total_count)>(page+1)*25?`<a href="?${e(params.toString())}&amp;inboxPage=${page+1}">Next</a>`:''}</nav>`,'messages',m.admin);
 }catch{return unavailable();}
};
