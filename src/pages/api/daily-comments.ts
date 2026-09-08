import type {APIRoute} from 'astro';
import {randomUUID} from 'node:crypto';
import {currentUser,json,origin} from '../../server/auth';
import {database,ensureMember} from '../../server/database';
import {sameOrigin} from '../../server/security.mjs';
import {allowRequest} from '../../server/abuse';
import {thoughtfulComment} from '../../server/feedback-policy.mjs';
const validDay=(value:string|null)=>{
 if(!value||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
 const date=new Date(value+'T12:00:00Z');if(Number.isNaN(+date)||Math.abs(Date.now()-+date)>36*60*60*1000)return null;
 return value;
};
const tipIndex=(day:string)=>Math.max(0,Math.floor((+new Date(day+'T00:00:00Z')-Date.UTC(2026,8,7))/86400000))%7;
const present=async(db:any,rows:any[])=>{
 const ids=[...new Set(rows.map(r=>r.user_id))];const profiles=ids.length?await db.from('profiles').select('user_id,display_name,identity_label,avatar_path').in('user_id',ids):{data:[],error:null};
 if(profiles.error)throw profiles.error;
 return rows.map(r=>{const p=profiles.data.find((x:any)=>x.user_id===r.user_id),name=p?.display_name||'Member';return {id:r.id,response:r.message,author:name,label:p?.identity_label||'TryMyBuild member',avatar:p?.avatar_path||'',initials:name.split(/\s+/).slice(0,2).map((w:string)=>w[0]).join('').toUpperCase(),createdAt:r.created_at,status:r.moderation_status};});
};
export const GET:APIRoute=async context=>{
 const day=validDay(context.url.searchParams.get('day'));if(!day)return json({error:'Invalid discussion day'},400);
 try{const db=database(),user=await currentUser(context),publicRows=await db.from('daily_discussion_comments').select('*').eq('day_key',day).eq('moderation_status','published').order('created_at');if(publicRows.error)throw publicRows.error;
  let rows=publicRows.data;if(user){const member=await ensureMember(user),own=await db.from('daily_discussion_comments').select('*').eq('day_key',day).eq('user_id',member.id).maybeSingle();if(own.error)throw own.error;if(own.data&&!rows.some((r:any)=>r.id===own.data.id))rows=[...rows,own.data];}
  return json({comments:await present(db,rows)});
 }catch{return json({error:'Today’s discussion is temporarily unavailable.'},503);}
};
export const POST:APIRoute=async context=>{
 if(!sameOrigin(context.request,origin(context)))return json({error:'Request not allowed.'},403);
 const user=await currentUser(context);if(!user)return json({error:'Sign in to join the discussion.'},401);if(!user.emailVerified)return json({error:'Verify your email before posting.'},403);
 try{if(!await allowRequest(user.id,'daily-comment',5))return json({error:'Please wait before posting again.'},429);const raw=await context.request.text();if(raw.length>2000)return json({error:'Request too large.'},413);
  const body=JSON.parse(raw),day=validDay(body.day),message=String(body.message||'').trim();if(!day||!thoughtfulComment(message))return json({error:'Write a thoughtful response of 7–150 words.'},400);
  const db=database(),member=await ensureMember(user),existing=await db.from('daily_discussion_comments').select('id').eq('user_id',member.id).eq('day_key',day).maybeSingle();if(existing.error)throw existing.error;
  const values={message,tip_index:tipIndex(day),moderation_status:'pending'};
  const saved=existing.data?await db.from('daily_discussion_comments').update(values).eq('id',existing.data.id):await db.from('daily_discussion_comments').insert({id:randomUUID(),user_id:member.id,day_key:day,...values});
  if(saved.error)throw saved.error;return json({saved:true,message:'Your response is awaiting community review.'});
 }catch{return json({error:'Your response could not be saved. Please try again.'},503);}
};
