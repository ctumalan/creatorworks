import type { APIContext } from 'astro';
import { currentUser, env } from './auth';
import { database, ensureMember } from './database';
import { isFounder } from './admin-policy.mjs';
import { surface, e } from './feedback-ui';
export async function memberContext(context:APIContext) {
 const user=await currentUser(context); if(!user)return null;
 return {user,member:await ensureMember(user),db:database(),admin:isFounder(user.id,env('FOUNDER_WORKOS_USER_ID'))};
}
export function notice(context:APIContext) {
 return context.url.searchParams.has('saved')?'<p class="cw-notice" role="status">Your changes were saved.</p>':context.url.searchParams.has('error')?'<p class="cw-notice" role="alert">That change was not confirmed. Reload and try again.</p>':'';
}
export function workspace(title:string,body:string,active:string,admin=false,identity?:{name:string,avatar?:string}) {
 const initials=(identity?.name||'Member').split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
 const picture=identity?`<span class="workspace-avatar">${identity.avatar?`<img src="${e(identity.avatar)}" alt="">`:e(initials)}</span>`:'';
 return surface(title,`<header class="workspace-heading ${identity?'workspace-welcome':''}">${picture}<div><p class="eyebrow">Your TryMyBuild</p><h1>${e(title)}</h1></div></header>${body}`,active,200,admin);
}
export const empty=(text:string)=>`<p class="cw-empty">${e(text)}</p>`;
