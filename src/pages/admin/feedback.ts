import type { APIRoute } from 'astro';
import { adminUser } from '../../server/admin';
import { database } from '../../server/database';
import { surface, adminSurface, unavailable, e, feedbackCard, pageNumber, pages } from '../../server/feedback-ui';
export const GET:APIRoute=async context=>{
 if(!await adminUser(context))return surface('Private administration','<h1>Administrator access required.</h1>','',403);
 try{
  const db=database(),page=pageNumber(context.url.searchParams.get('page'));
  let html='<a href="/admin">← Administration</a><h1>Feedback review</h1><nav class="cw-row"><a href="/admin/feedback">Public feedback queue</a><a href="/admin/feedback?view=history">Decision history</a></nav>';
  if(context.url.searchParams.has('notice'))html+='<p class="cw-notice" role="status">'+(context.url.searchParams.get('notice')==='saved'?'Decision saved and recorded.':'The decision was not confirmed. Reload before trying again.')+'</p>';
  if(context.url.searchParams.get('view')==='history'){
   const result=await db.from('feedback_review_history').select('id,feedback_id,actor_user_id,previous_status,new_status,reason,created_at',{count:'exact'}).order('created_at',{ascending:false}).order('id').range(page*25,page*25+24);
   if(result.error)throw result.error;
   html+=result.data.map(r=>`<article class="cw-panel"><h3>${e(r.previous_status)} → ${e(r.new_status)}</h3><p>${e(r.reason)}</p><p class="cw-meta">${e(r.created_at)} · Feedback ${e(r.feedback_id)} · Actor ${e(r.actor_user_id)}</p></article>`).join('')||'<p>No review decisions yet.</p>';
   html+=pages('/admin/feedback?view=history',page,result.count||0);
  }else{
   const status=['pending','published','hidden'].includes(context.url.searchParams.get('status')||'')?context.url.searchParams.get('status')!:'pending';
   html+=`<nav class="cw-row">${['pending','published','hidden'].map(s=>`<a href="/admin/feedback?status=${s}">${s}</a>`).join('')}</nav><p class="cw-meta">Only feedback the visitor chose to share publicly appears here. Private feedback cannot be published.</p>`;
   const result=await db.from('creator_feedback').select('*',{count:'exact'}).eq('visibility','public').eq('moderation_status',status).order('created_at',{ascending:false}).order('id').range(page*25,page*25+24);
   if(result.error)throw result.error;
   html+=result.data.map(row=>feedbackCard(row,row.project_slug,'Community member',false)+`<form class="cw-panel" action="/api/admin/feedback-review" method="post"><input type="hidden" name="id" value="${e(row.id)}"><input type="hidden" name="previous" value="${e(row.moderation_status)}"><label>Decision<select name="status" required><option value="">Choose a decision</option><option value="published">Publish</option><option value="hidden">Hide</option><option value="pending">Return to review</option></select></label><label>Reason<input type="text" name="reason" minlength="3" maxlength="300" required></label><label><input type="checkbox" name="confirm" value="yes" required> I reviewed this feedback and confirm my decision.</label><p><button class="primary-button" type="submit">Save decision</button></p></form>`).join('')||'<p class="cw-panel">No feedback in this queue.</p>';
   html+=pages('/admin/feedback?status='+status,page,result.count||0);
  }
  return adminSurface('Feedback review',html,'feedback');
 }catch{return unavailable();}
};
