import {selectedInterests} from '../../server/interest-policy.mjs';
import {notificationKey} from '../../server/notifications';
import type { APIRoute } from 'astro';
import { memberContext } from '../../server/workspace';
import { origin,env } from '../../server/auth';
import { sameOrigin } from '../../server/security.mjs';
import { caseInput,preferences } from '../../server/dashboard-policy.mjs';
import { allowRequest } from '../../server/abuse';
const uuid=(x:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(x);
export const POST:APIRoute=async context=>{
 if(!sameOrigin(context.request,origin(context)))return new Response('Forbidden',{status:403});
 let section='overview',id='';const back=(ok:boolean)=>context.redirect(`/dashboard/${section}?${ok?'saved':'error'}=1${id?'&case='+id:''}`,303);
 try{
  const m=await memberContext(context);if(!m||!m.user.emailVerified)return new Response('Sign in with a verified email',{status:401});
  if(!await allowRequest(m.user.id,'dashboard',20))return new Response('Please wait a minute',{status:429});
  const raw=await context.request.text();if(raw.length>20000)return new Response('Too large',{status:413});
  const fields=new URLSearchParams(raw),f=Object.fromEntries(fields);section=['preferences','notifications','help','verification'].includes(f.section)?f.section:'overview';const {db,member}=m;let r:any;
  if(f.action==='preferences'||f.action==='alerts'){
   const p=preferences(f);if(!p)return back(false);
   const interests=selectedInterests(fields.getAll('interest'));if(f.action==='preferences'&&!interests)return back(false);
   r=await db.from('account_preferences').upsert({user_id:member.id,...(f.action==='alerts'?{feedback_alerts:p.feedback_alerts,publication_alerts:p.publication_alerts}:{tips:p.tips,personalization:p.personalization,selected_interests:interests}),updated_at:new Date().toISOString()});
  if(!r.error&&f.action==='alerts')r=await db.from('site_settings').upsert({key:notificationKey(member.id),value:{review_opportunities:f.reviewOpportunities==='on',saved_updates:f.savedUpdates==='on',recommendations:f.recommendations==='on',activity_digest:f.activityDigest==='on',draft_reminders:f.draftReminders==='on'},updated_at:new Date().toISOString()});
  }else if(f.action==='preferences-reset'){
   r=await db.from('category_engagement').delete().eq('user_id',member.id);if(!r.error)r=await db.from('account_preferences').upsert({user_id:member.id,interests:[],updated_at:new Date().toISOString()});
  }else if(f.action==='read'||f.action==='read-all'){
   let q=db.from('notifications').update({read_at:new Date().toISOString()}).eq('user_id',member.id).is('read_at',null);if(f.action==='read'){if(!uuid(f.id))return back(false);q=q.eq('id',f.id);}r=await q;
  }else if(f.action==='case-create'){
   const input=caseInput(f);if(!input||!uuid(f.id))return back(false);
   if(input.kind==='verification'){
    r=await db.rpc('cw_request_verification',{p_user:member.id,p_id:f.id,p_subject:input.subject,p_message:input.message,p_project:input.project_slug});
    if(r.error)return context.redirect('/dashboard/verification?error=eligibility',303);
    id=r.data;section='help';return back(true);
   }
   // A random id makes retries idempotent without allowing an existing case to be overwritten.
   r=await db.from('support_cases').upsert({id:f.id,user_id:member.id,...input},{onConflict:'id',ignoreDuplicates:true});
   const owned=await db.from('support_cases').select('id').eq('id',f.id).eq('user_id',member.id).maybeSingle();if(!owned.data)return back(false);id=f.id;
  }else if(f.action==='case-reply'){
   if(!uuid(f.id)||!uuid(f.request)||!/^\d{1,9}$/.test(f.revision))return back(false);id=f.id;
   r=await db.rpc('cw_case_reply',{p_actor:member.id,p_case:id,p_request:f.request,p_message:f.message,p_staff:false,p_founder:env('FOUNDER_WORKOS_USER_ID'),p_revision:Number(f.revision),p_status:'open'});
  }else return back(false);
  return back(!r.error);
 }catch{return back(false);}
};
