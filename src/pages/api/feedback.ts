import { allowRequest } from '../../server/abuse';
import type { APIRoute } from 'astro';
import { currentUser, origin, json } from '../../server/auth';
import { database, ensureMember } from '../../server/database';
import { sameOrigin } from '../../server/security.mjs';
import { feedbackInput } from '../../server/feedback-policy.mjs';
export const POST:APIRoute=async context=>{
 if(!sameOrigin(context.request,origin(context))) return json({error:'Request not allowed.'},403);
 const user=await currentUser(context);if(!user)return json({error:'Please sign in.'},401);
 let slug='';
 try{
  if(!user.emailVerified)return json({error:'Verify your email before posting.'},403);
  if(!await allowRequest(user.id,'feedback'))return json({error:'Please wait a minute before trying again.'},429);
  const raw=await context.request.text();if(raw.length>12000)return json({error:'Request too large.'},413);
  const input=feedbackInput(Object.fromEntries(new URLSearchParams(raw)));if(!input)return json({error:'Choose usefulness, price and visibility, then write 7–150 words.'},400);
  slug=input.project_slug;
  const member=await ensureMember(user),db=database();
  const project=await db.from('projects').select('owner_user_id').eq('slug',slug).eq('visibility','public').maybeSingle();
  if(project.error)throw project.error;
  if(!project.data?.owner_user_id)return json({error:'This creator inbox is not connected yet.'},409);
  if(project.data.owner_user_id===member.id)return json({error:'This is your project. Use your creator workspace to read visitor feedback.'},403);
  const result=await db.from('creator_feedback').insert({...input,author_user_id:member.id,moderation_status:'pending'}).select('id').single();
  if(result.error?.code==='23505'){
   const existing=await db.from('creator_feedback').select('id').eq('project_slug',slug).eq('author_user_id',member.id).single();
   if(existing.error)throw existing.error;return context.redirect(`/dashboard/thread/${existing.data.id}`,303);
  }
  if(result.error)throw result.error;
  return context.redirect(`/dashboard/thread/${result.data.id}?sent=1`,303);
 }catch{return context.redirect(slug?`/tell/${slug}?error=1`:'/dashboard?error=1',303);}
};
