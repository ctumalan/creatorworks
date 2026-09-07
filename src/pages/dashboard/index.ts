import type { APIRoute } from 'astro';
import { currentUser, env } from '../../server/auth';
import { isFounder } from '../../server/admin-policy.mjs';
import { PROJECT_STATUS_LABELS } from '../../server/listing-policy.mjs';
import { database, ensureMember } from '../../server/database';
import { surface, signIn, unavailable, e, feedbackCard, pages, pageNumber } from '../../server/feedback-ui';

async function titlesFor(db:any, slugs:string[]) {
  const unique=[...new Set(slugs)].filter(Boolean);
  if(!unique.length) return new Map<string,string>();
  const { data } = await db.from('projects').select('slug,title').in('slug', unique);
  return new Map<string,string>((data||[]).map((r:any)=>[r.slug,r.title]));
}

export const GET:APIRoute=async context=>{
 if(!['creator','visitor'].includes(context.url.searchParams.get('view')||''))return context.redirect('/dashboard/overview',302);
 const creator=context.url.searchParams.get('view')==='creator',user=await currentUser(context);
 if(!user)return signIn(creator?'/dashboard?view=creator':'/dashboard');
 try{
  const member=await ensureMember(user),db=database(),page=pageNumber(context.url.searchParams.get('page'));
  const owned=await db.from('projects').select('slug,title,category,listing_status').eq('owner_user_id',member.id).order('updated_at',{ascending:false});
  if(owned.error)throw owned.error;
  const admin = isFounder(user.id,env('FOUNDER_WORKOS_USER_ID'));
  let header=`<header><h1>${creator?'My projects':'My discoveries'}</h1></header>`;
  if(creator&&!owned.data.length)return surface('Creator workspace',header+'<section class="cw-panel"><h2>Create your first listing.</h2><p>Add your project, preview how it will look, and publish it for review. Once it’s approved it appears in the public catalog, and any feedback shows up here.</p><a class="primary-button" href="/?listing=settings&new=1">Add project</a></section>',"creator",200,admin);
  const selected=creator?owned.data.find(p=>p.slug===context.url.searchParams.get('project'))||owned.data[0]:null;
  let query=db.from('creator_feedback').select('id,project_slug,author_user_id,helpful,price,message,visibility,moderation_status,created_at',{count:'exact'});
  query=creator?query.eq('project_slug',selected!.slug):query.eq('author_user_id',member.id);
  const result=await query.order('created_at',{ascending:false}).order('id').range(page*25,page*25+24);
  const titleMap=await titlesFor(db, creator?[]:(result.data||[]).map((r:any)=>r.project_slug));
  let feedback='';
  if(result.error)feedback='<p class="cw-notice">Your feedback inbox is being connected. No feedback has been loaded yet.</p>';
  else{
   const ids=[...new Set(result.data.map(r=>r.author_user_id))];
   const profiles=ids.length?await db.from('profiles').select('user_id,display_name,avatar_path').in('user_id',ids):{data:[],error:null};
   if(profiles.error)throw profiles.error;
   feedback=result.data.length?result.data.map(row=>feedbackCard(row,(creator?selected!.title:titleMap.get(row.project_slug))||row.project_slug,profiles.data?.find(p=>p.user_id===row.author_user_id)?.display_name||'Member',true,profiles.data?.find(p=>p.user_id===row.author_user_id)?.avatar_path||'')).join(''):`<section class="cw-panel"><h2>${creator?'Your next insight starts with a conversation.':'You haven’t sent feedback yet.'}</h2><p>${creator?'Share the project’s “Tell the creator” link. No invitation is required to participate.':'Try a project, then tell its creator what worked for you.'}</p><a href="${creator?'/projects/'+selected!.slug:'/'}">${creator?'View project invitation →':'Find something useful →'}</a></section>`;
   feedback+=pages(creator?`/dashboard?view=creator&project=${selected!.slug}`:'/dashboard?view=visitor',page,result.count||0);
  }
  if(creator){
   const rows=result.data||[];
   const statusLabel=(s:string)=>(PROJECT_STATUS_LABELS as any)[s]||s;
   header+=`<div class="cw-grid"><aside class="cw-panel"><h2>Your projects</h2><nav aria-label="Your projects">${owned.data.map(p=>`<p><a href="/dashboard?view=creator&project=${e(p.slug)}" ${p.slug===selected!.slug?'aria-current="page"':''}>${e(p.title||'Untitled draft')}</a><br><span class="cw-meta">${e(statusLabel(p.listing_status))}</span></p>`).join('')}</nav><p><a class="primary-button" href="/?listing=settings&new=1">Add project</a></p></aside><section><h2>${e(selected!.title||'Untitled draft')}</h2><p class="cw-meta">${e(statusLabel(selected!.listing_status))}</p><div class="cw-row"><a class="cw-link" href="/?listing=settings&project=${e(selected!.slug)}">Edit or publish this listing →</a>${selected!.listing_status==='published'?`<a class="primary-button" href="/?category=${encodeURIComponent(selected!.category)}&amp;highlight=${e(selected!.slug)}">View my project in catalog</a><a class="cw-link" href="/projects/${e(selected!.slug)}">View invitation page ↗</a><button class="secondary-button" data-invite-project="${e(selected!.slug)}">Preview invitation</button>`:''}</div>${!result.error&&rows.length?`<div class="cw-stats"><div class="cw-stat"><strong>${rows.filter(r=>r.helpful==='yes').length} / ${rows.length}</strong>said it helped</div><div class="cw-stat"><strong>${rows.filter(r=>r.price==='too_expensive').length} / ${rows.length}</strong>said the price was too high</div></div><p class="cw-meta">Feedback shown on this page only. These are self-reported opinions, not a quality score or verified purchases.</p>`:''}${feedback}</section></div>`;
  }else{
   const saved=await db.from('saved_projects').select('project_slug',{count:'exact'}).eq('user_id',member.id).order('created_at',{ascending:false}).limit(50);
   if(saved.error)throw saved.error;
   const savedTitles=await titlesFor(db,(saved.data||[]).map((r:any)=>r.project_slug));
   header+=`<div class="cw-grid"><aside class="cw-panel"><h2>Saved for later</h2>${saved.data.length?saved.data.map(row=>`<p><a href="/?project=${e(row.project_slug)}">${e(savedTitles.get(row.project_slug)||row.project_slug)}</a><br><a class="cw-meta" href="/tell/${e(row.project_slug)}">Tell the creator →</a></p>`).join(''):'<p>Save something that catches your eye while browsing.</p>'}<p class="cw-meta">${saved.data.length} of ${saved.count||0} saved projects shown</p><a href="/">Browse tools →</a></aside><section><h2>My feedback & replies</h2><p class="cw-meta">Open a conversation to read replies or add an update.</p>${feedback}</section></div>`;
  }
  return surface(creator?'My projects':'My discoveries',header,creator?'creator':'visitor',200,admin);
 }catch{return unavailable();}
};
