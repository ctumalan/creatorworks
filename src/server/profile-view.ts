import type { APIRoute } from 'astro';
import {listPublished,STUDIO,studioNote} from './catalog-db';
import {projectCard} from './project-ui';
import {database,databaseReady,ensureMember} from './database';
import {currentUser} from './auth';
import {surface,e,signIn} from './feedback-ui';
export const profileView:APIRoute=async context=>{
 if(!databaseReady())return surface('Profile unavailable','<p>Profiles are temporarily unavailable.</p>','',503);
 try{
  const db=database(),slug=context.params.slug||'',self=slug==='me',studio=slug===STUDIO.slug;let person:any,ownerId='';
  if(studio)person={display_name:STUDIO.name,identity_label:STUDIO.label,bio:STUDIO.bio,verified:true};
  else{let query=db.from('profiles').select('user_id,display_name,identity_label,bio,avatar_path,website,verified,is_public');
   if(self){const user=await currentUser(context);if(!user)return signIn('/people/me');const member=await ensureMember(user);query=query.eq('user_id',member.id);}else query=query.eq('slug',slug).eq('is_public',true);
   const r=await query.maybeSingle();if(r.error)throw r.error;if(!r.data)return surface('Profile not found','<p>This member has not made a public profile available.</p>','',404);person=r.data;ownerId=person.user_id;}
  const owned=studio?null:await db.from('projects').select('slug').eq('owner_user_id',ownerId).eq('listing_status','published');if(owned?.error)throw owned.error;
  const slugs=new Set(owned?.data?.map(p=>p.slug)||[]),projects=(await listPublished()).filter(p=>studio?p.creator.slug===STUDIO.slug:slugs.has(p.slug));
  const initials=person.display_name.split(/\s+/).slice(0,2).map((part:string)=>part[0]).join('');
  return surface(person.display_name,`<div data-panel-content><section class="profile-hero"><span class="person-avatar large">${person.avatar_path?`<img src="${e(person.avatar_path)}" alt="">`:e(initials)}</span><div><p class="eyebrow">${self&&!person.is_public?'Your private profile preview':'TryMyBuild creator'}</p><h1>${e(person.display_name)}</h1><strong>${e(person.identity_label||'')}</strong><p>${e(person.bio||'')}</p>${person.website?`<a href="${e(person.website)}" target="_blank" rel="noopener noreferrer nofollow">Website ↗</a>`:''}${self?'<p><a class="secondary-button" href="/dashboard/profile">Edit my profile</a></p>':''}</div></section>${studio?`<p class="cw-meta">${e(studioNote)}</p>`:person.verified?'<p>Creator identity reviewed by TryMyBuild.</p>':''}<section class="profile-work"><h2>Published projects · ${projects.length}</h2>${projects.map(projectCard).join('')||'<p>No published projects yet.</p>'}</section></div>`);
 }catch{return surface('Profile unavailable','<p>The profile could not be loaded. Please try again.</p>','',503);}
};
