import {verificationProgress} from './verification';
export async function creditSummary(db:any,userId:string){
 const [totals,qualified,projects,requests,verification]=await Promise.all([
  db.rpc('cw_credit_totals',{p_user:userId}),
  db.from('feedback_qualifications').select('feedback_id,project_slug,creator_user_id,status,reason,updated_at').eq('user_id',userId).order('updated_at',{ascending:false}).limit(100),
  db.from('projects').select('id,slug,title,category,listing_status').eq('owner_user_id',userId).order('updated_at',{ascending:false}),
  db.from('feedback_requests').select('id,project_slug,status,created_at,updated_at').eq('user_id',userId).order('created_at',{ascending:false}),
  verificationProgress(db,userId)
 ]);
 if([totals,qualified,projects,requests].some(r=>r.error)||!totals.data?.[0])throw Error('Community progress unavailable');
 const t=totals.data[0],eligible=Number(t.eligible);
 return {balance:Number(t.balance),eligible,slots:Number(t.slots),used:Number(t.used),verification,
  towardNext:eligible%5,projects:projects.data,requests:requests.data,qualifications:qualified.data};
}
export async function feedbackQueue(db:any,userId:string){
 const r=await db.from('feedback_requests').select('id,project_slug,created_at').eq('status','queued').neq('user_id',userId).order('created_at').limit(50);
 if(r.error)throw r.error;if(!r.data.length)return [];
 const projects=await db.from('projects').select('slug,title,summary,category,preview_public_url,owner_user_id').in('slug',r.data.map((x:any)=>x.project_slug)).eq('listing_status','published');
 if(projects.error)throw projects.error;
 const prior=await db.from('creator_feedback').select('project_slug').eq('author_user_id',userId).in('project_slug',r.data.map((x:any)=>x.project_slug));if(prior.error)throw prior.error;
 return r.data.map((x:any)=>({...x,project:projects.data.find((p:any)=>p.slug===x.project_slug)})).filter((x:any)=>x.project&&x.project.owner_user_id!==userId&&!prior.data.some((f:any)=>f.project_slug===x.project_slug)).slice(0,20);
}
export async function publicationAccess(db:any,userId:string,projectId:string){
 const [assigned,grants,used]=await Promise.all([
  db.from('project_slot_assignments').select('project_id').eq('project_id',projectId).eq('user_id',userId).maybeSingle(),
  db.from('project_slot_grants').select('id',{head:true,count:'exact'}).eq('user_id',userId),
  db.from('project_slot_assignments').select('project_id',{head:true,count:'exact'}).eq('user_id',userId)
 ]);
 if(assigned.error||grants.error||used.error)throw Error('Project access unavailable');
 const slots=1+(grants.count||0),taken=used.count||0;
 return {allowed:!!assigned.data||taken<slots,slots,used:taken};
}
