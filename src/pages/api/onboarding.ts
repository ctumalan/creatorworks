import type { APIRoute } from 'astro';
import { memberContext } from '../../server/workspace';
import { json, origin } from '../../server/auth';
import { sameOrigin } from '../../server/security.mjs';
import { allowRequest } from '../../server/abuse';
import { wishCategories } from '../../server/wish-policy.mjs';
import { notificationKey, notificationPreferences } from '../../server/notifications';
export const POST: APIRoute = async context => {
 if(!sameOrigin(context.request,origin(context)))return json({error:'Request not allowed.'},403);
 try{
  const m=await memberContext(context);if(!m)return json({error:'Sign in required.'},401);
  if(!await allowRequest(m.user.id,'onboarding',10))return json({error:'Please wait.'},429);
  const raw=await context.request.text();if(raw.length>5000)return json({error:'Too large.'},413);
  const body=JSON.parse(raw);
  if(!Array.isArray(body.interests)||body.interests.length>33||body.interests.some((x:unknown)=>typeof x!=='string'||!wishCategories.includes(x))||typeof body.alerts!=='boolean')return json({error:'Invalid preferences.'},400);
  const interests=[...new Set(body.interests)];
  const r=await m.db.from('account_preferences').upsert({user_id:m.member.id,selected_interests:interests},{onConflict:'user_id'});if(r.error)throw r.error;
  const preferences=await notificationPreferences(m.db,m.member.id);
  const n=await m.db.from('site_settings').upsert({key:notificationKey(m.member.id),value:{...preferences,recommendations:body.alerts}},{onConflict:'key'});if(n.error)throw n.error;
  return json({saved:true});
 }catch{return json({error:'Your interests could not be saved. Please retry from account preferences.'},503);}
};
