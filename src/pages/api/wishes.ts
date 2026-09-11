import type { APIRoute } from 'astro';
import { json, origin } from '../../server/auth';
import { database, databaseReady } from '../../server/database';
import { memberContext } from '../../server/workspace';
import { sameOrigin } from '../../server/security.mjs';
import { allowRequest } from '../../server/abuse';
import { validWish } from '../../server/wish-policy.mjs';
export const GET: APIRoute = async () => {
 try {
  if(!databaseReady())return json({error:'Wish lists are not connected yet.'},503);
  const result=await database().from('community_wishes').select('id,category,description,created_at').order('created_at',{ascending:false}).limit(200);
  if(result.error)throw result.error;
  return json({wishes:result.data});
 }catch{return json({error:'Wish lists are temporarily unavailable.'},503);}
};
export const POST: APIRoute = async context => {
 if(!sameOrigin(context.request,origin(context)))return json({error:'Request not allowed.'},403);
 try {
  const m=await memberContext(context);if(!m)return json({error:'Sign in to submit your wish.'},401);
  if(!m.user.emailVerified)return json({error:'Verify your email before submitting a wish.'},403);
  if(!await allowRequest(m.user.id,'community-wishes',5,3600))return json({error:'Please wait before sharing more wishes.'},429);
  const raw=await context.request.text();if(raw.length>2000)return json({error:'Wish is too long.'},413);
  const body=JSON.parse(raw),description=typeof body.description==='string'?body.description.trim():'';
  if(!validWish(body.category,description))return json({error:'Choose a category and describe your wish in 4–11 words.'},400);
  const result=await m.db.from('community_wishes').upsert({user_id:m.member.id,category:body.category,description},{onConflict:'user_id,category,description',ignoreDuplicates:true});
  if(result.error)throw result.error;
  return json({saved:true});
 }catch{return json({error:'Your wish could not be submitted. Your draft is still on this device.'},503);}
};
