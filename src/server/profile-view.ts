import type { APIRoute } from 'astro';
import {listPublished,STUDIO,studioNote} from './catalog-db';
import {projectCard} from './project-ui';
import {database,databaseReady,ensureMember} from './database';
import {currentUser} from './auth';
import {surface,e,signIn} from './feedback-ui';
import {publicProfile} from './public-profile';
import {directComposer} from './direct-messages';
export const profileView:APIRoute=async context=>{
 if(!databaseReady())return surface('Profile unavailable','<p>Profiles are temporarily unavailable.</p>','',503);
 try{
  const db=database(),slug=context.params.slug||'',self=slug==='me',studio=slug===STUDIO.slug;let person:any,ownerId='';
  if(studio){person=await publicProfile(db,slug);person.identity_label=STUDIO.label;ownerId=person.user_id;}
  else if(self){const user=await currentUser(context);if(!user)return signIn('/people/me');const member=await ensureMember(user);
   const r=await db.from('profiles').select('user_id,slug,display_name,identity_label,bio,avatar_path,website,verified,is_public').eq('user_id',member.id).maybeSingle();if(r.error)throw r.error;person=r.data;ownerId=member.id;}
  else{person=await publicProfile(db,slug);ownerId=person?.user_id||'';}
  if(!person)return surface('Profile not found','<p>This member has not made a public profile available.</p>','',404);
  const owned=studio?null:await db.from('projects').select('slug').eq('owner_user_id',ownerId).eq('listing_status','published');if(owned?.error)throw owned.error;
  const slugs=new Set(owned?.data?.map(p=>p.slug)||[]),projects=(await listPublished()).filter(p=>studio?p.creator.slug===STUDIO.slug:slugs.has(p.slug));
  const initials=person.display_name.split(/\s+/).slice(0,2).map((part:string)=>part[0]).join('');
  const user=await currentUser(context),viewer=user?await ensureMember(user):null,canonical=studio?STUDIO.slug:person.slug;
  const tools=`<div class="profile-tools">${person.is_public?`<button type="button" class="secondary-button" data-share-profile="${e(canonical)}">Share profile</button>`:'<span class="cw-meta">Make your profile public before sharing it.</span>'}</div>`;
  const message=viewer?.id===ownerId?'':`<details class="cw-panel direct-message-entry"><summary>Message this creator</summary>${viewer?directComposer(canonical):`<p>Sign in to send a private message. Your conversation stays in Messages.</p><a class="primary-button" href="/auth/sign-in?next=${encodeURIComponent('/people/'+canonical)}">Sign in to message</a>`}</details>`;
  const stats=`<section class="cw-panel profile-statistics"><h2>Public project activity</h2><div class="workspace-summary"><div><strong>${projects.length}</strong><span>Published projects</span></div><div><strong>${projects.reduce((n,p)=>n+p.reviewCount,0)}</strong><span>Published comments & reviews</span></div><div><strong>${projects.reduce((n,p)=>n+p.saveCount,0)}</strong><span>Current saves</span></div></div><details><summary>By project</summary><div class="table-scroll"><table class="performance-table"><thead><tr><th>Project</th><th>Public comments</th><th>Saved</th></tr></thead><tbody>${projects.map(p=>`<tr><td><a href="/projects/${e(p.slug)}">${e(p.name)}</a></td><td>${p.reviewCount}</td><td>${p.saveCount}</td></tr>`).join('')}</tbody></table></div></details><p class="cw-meta">Published projects and approved public contributions only. Visits and shares aren’t tracked.</p></section>`;
  return surface(person.display_name,`<div data-panel-content><section class="profile-hero"><span class="person-avatar large">${person.avatar_path?`<img src="${e(person.avatar_path)}" alt="">`:e(initials)}</span><div><p class="eyebrow">${self&&!person.is_public?'Your private profile preview':'TryMyBuild creator'}</p><h1>${e(person.display_name)}</h1><strong>${e(person.identity_label||'')}</strong><p>${e(person.bio||'')}</p>${person.website?`<a href="${e(person.website)}" target="_blank" rel="noopener noreferrer nofollow">Website ↗</a>`:''}${self?'<p><a class="secondary-button" href="/dashboard/profile">Edit my profile</a></p>':''}</div></section>${studio?`<p class="cw-meta">${e(studioNote)}</p>`:person.verified?'<p>Creator identity reviewed by TryMyBuild.</p>':''}${tools}${stats}${message}<section class="profile-work"><h2>Published projects · ${projects.length}</h2>${projects.map(projectCard).join('')||'<p>No published projects yet.</p>'}</section></div>`);
 }catch{return surface('Profile unavailable','<p>The profile could not be loaded. Please try again.</p>','',503);}
};
