import type {APIRoute} from 'astro';
import {memberContext} from '../../server/workspace';
import {origin} from '../../server/auth';
import {sameOrigin} from '../../server/security.mjs';
import {allowRequest} from '../../server/abuse';
import {readBuilds,changeBuild,saveBuilds} from '../../server/builds';
import {surface,e} from '../../server/feedback-ui';
export const POST:APIRoute=async context=>{
 if(!sameOrigin(context.request,origin(context)))return new Response('Forbidden',{status:403});
 let slug='';
 try{
  const m=await memberContext(context);if(!m||!m.user.emailVerified)return new Response('Sign in with a verified email.',{status:401});
  if(!await allowRequest(m.user.id,'builds',10))return new Response('Please wait a minute before updating another build.',{status:429});
  const raw=await context.request.text();if(raw.length>4000)return new Response('Request too large',{status:413});
  const f=Object.fromEntries(new URLSearchParams(raw));slug=f.project||'';
  const r=await m.db.from('projects').select('id,listing_status').eq('slug',slug).eq('owner_user_id',m.member.id).maybeSingle();
  if(r.error)throw Error('Project unavailable. Please try again.');if(!r.data)return new Response('Project not found',{status:404});
  const before=await readBuilds(m.db,r.data.id),next=changeBuild(before,f,r.data.listing_status==='published');
  await saveBuilds(m.db,r.data.id,before,next);
  return context.redirect('/dashboard/builds?project='+encodeURIComponent(slug)+'&saved=1',303);
 }catch(error){return surface('Build not saved',`<h1>Build not saved</h1><p role="alert">${e(error instanceof Error?error.message:'Please try again.')}</p><a href="/dashboard/builds?project=${encodeURIComponent(slug)}">Return to build settings</a>`,'creator',400);}
};
