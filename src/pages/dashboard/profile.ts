import type { APIRoute } from 'astro';
import { currentUser, env } from '../../server/auth';
import { database, ensureMember } from '../../server/database';
import { isFounder } from '../../server/admin-policy.mjs';
import { surface, signIn, e } from '../../server/feedback-ui';

export const GET: APIRoute = async context => {
 const user = await currentUser(context);
 if (!user) return signIn('/dashboard/profile');
 const admin = isFounder(user.id, env('FOUNDER_WORKOS_USER_ID'));
 try {
  const member = await ensureMember(user);
  const {data:p,error} = await database().from('profiles').select('display_name,identity_label,bio,is_public,avatar_path,website,slug').eq('user_id',member.id).single();
  if(error) throw error;
  return surface('Edit profile', `<header><h1>Edit profile</h1></header><section class="cw-panel"><form id="profile-form"><fieldset><legend>Profile photo or avatar</legend><img id="avatar-preview" class="person-avatar large" src="${e(p.avatar_path || '/assets/avatars/leaf.svg')}" alt="Your profile image"><label for="photo">Upload a photo</label><input id="photo" type="file" accept="image/jpeg,image/png,image/webp"><p class="cw-meta">JPG, PNG, or WebP, up to 5 MB. Photos are cropped to a square.</p><div class="avatar-choices">${['leaf','sun','wave','spark'].map(a=>`<button type="button" data-avatar="/assets/avatars/${a}.svg" aria-label="Choose ${a} avatar"><img src="/assets/avatars/${a}.svg" alt=""></button>`).join('')}<button type="button" data-avatar="">Use my initial</button></div></fieldset><label for="displayName">Your public name</label><input type="text" id="displayName" name="displayName" value="${e(p.display_name)}" maxlength="60" required><label for="label">How you describe yourself</label><input type="text" id="label" name="label" value="${e(p.identity_label||'')}" maxlength="60" placeholder="Musician, Parent, Engineer…"><label for="bio">A little about you</label><textarea id="bio" name="bio" maxlength="500">${e(p.bio||'')}</textarea><label for="website">Website (optional)</label><input id="website" name="website" type="url" maxlength="1000" value="${e(p.website)}" placeholder="https://your-site.com"><label class="cw-choice"><input type="checkbox" name="isPublic" ${p.is_public?'checked':''}>Make my profile public</label><p id="profile-status" role="status" aria-live="polite"></p><button class="primary-button" type="submit">Save my profile</button></form></section><form action="/auth/sign-out" method="post"><button class="secondary-button" type="submit">Sign out</button></form><script>
let avatarValue;
document.querySelectorAll('[data-avatar]').forEach(button => button.onclick = () => { avatarValue=button.dataset.avatar; document.getElementById('avatar-preview').src=avatarValue || '/assets/avatars/leaf.svg'; });
document.getElementById('photo').onchange = async event => {
 const file=event.target.files[0]; if(!file)return;
 const status=document.getElementById('profile-status');
 if(file.size>5*1024*1024 || !['image/jpeg','image/png','image/webp'].includes(file.type)){status.textContent='Choose a JPG, PNG, or WebP under 5 MB.';return;}
 try {const bitmap=await createImageBitmap(file); const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const edge=Math.min(bitmap.width,bitmap.height);canvas.getContext('2d').drawImage(bitmap,(bitmap.width-edge)/2,(bitmap.height-edge)/2,edge,edge,0,0,256,256);bitmap.close();avatarValue=canvas.toDataURL('image/jpeg',0.85);document.getElementById('avatar-preview').src=avatarValue;status.textContent='Photo ready. Save your profile to apply it.';}catch{status.textContent='That photo could not be read.';}
};
document.getElementById('profile-form').addEventListener('submit', async event => {
 event.preventDefault(); const form=event.currentTarget, values=new FormData(form), button=form.querySelector('button'), status=document.getElementById('profile-status');
 button.disabled=true; status.textContent='Saving…';
 try { const result=await fetch('/api/me',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({avatar:avatarValue,website:values.get('website'),displayName:values.get('displayName'),label:values.get('label'),bio:values.get('bio'),isPublic:values.get('isPublic')==='on'})}); const data=await result.json(); if(!result.ok)throw new Error(data.error||'Please try again.'); status.textContent='Your profile is saved.'; }
 catch(error){status.textContent=error.message||'Your profile could not be saved. Please try again.';} finally{button.disabled=false;}
});</script>`, 'profile',200,admin);
 } catch { return surface('Edit profile','<h1>Edit profile</h1><p role="alert">Your profile could not be loaded. Please try again.</p><a href="/dashboard/profile">Try again</a>','profile',503,admin); }
};
