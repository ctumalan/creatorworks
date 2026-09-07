import type { APIRoute } from 'astro';
import { memberContext } from '../../server/workspace';
import { allowRequest } from '../../server/abuse';
export const GET:APIRoute=async context=>{
 try{
  const m=await memberContext(context);if(!m)return new Response('Sign in required',{status:401});
  if(!await allowRequest(m.user.id,'export',2,300))return new Response('Please wait five minutes before another export',{status:429});
  const read=async(table:string,key:string)=>{let rows:any[]=[];for(let page=0;;page++){const r=await m.db.from(table).select('*').eq(key,m.member.id).order(table==='profiles'||table==='account_preferences'||table==='account_deletion_requests'?'user_id':'created_at').range(page*500,page*500+499);if(r.error)throw r.error;rows.push(...r.data);if(r.data.length<500)return rows;}};
  const tables=[['profiles','user_id'],['projects','owner_user_id'],['saved_projects','user_id'],['creator_feedback','author_user_id'],['feedback_replies','author_user_id'],['project_experiences','author_user_id'],['account_preferences','user_id'],['notifications','user_id'],['support_cases','user_id'],['support_messages','author_id'],['account_deletion_requests','user_id']];
  const output:any={exportedAt:new Date().toISOString(),email:m.user.email};
  for(const [t,k] of tables)output[t]=await read(t,k);
  return new Response(JSON.stringify(output,null,2),{headers:{'Content-Type':'application/json','Content-Disposition':'attachment; filename="creatorworks-my-data.json"','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
 }catch{return new Response('Your export could not be completed. Please try again.',{status:503});}
};
