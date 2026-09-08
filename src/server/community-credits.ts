export async function creditSummary(db:any,userId:string){
 const [ledger,qualified,grants,assigned,projects,requests]=await Promise.all([
  db.from('credit_ledger').select('amount').eq('user_id',userId),
  db.from('feedback_qualifications').select('feedback_id,project_slug,status,reason,updated_at').eq('user_id',userId).order('updated_at',{ascending:false}),
  db.from('project_slot_grants').select('id').eq('user_id',userId),
  db.from('project_slot_assignments').select('project_id').eq('user_id',userId),
  db.from('projects').select('id,slug,title,category,listing_status').eq('owner_user_id',userId).order('updated_at',{ascending:false}),
  db.from('feedback_requests').select('id,project_slug,status,created_at,updated_at').eq('user_id',userId).order('created_at',{ascending:false})
 ]);
 if([ledger,qualified,grants,assigned,projects,requests].some(r=>r.error))throw Error('Community progress unavailable');
 const eligible=qualified.data.filter((q:any)=>q.status==='qualified').length;
 return {balance:ledger.data.reduce((n:number,r:any)=>n+r.amount,0),eligible,slots:1+grants.data.length,used:assigned.data.length,
  towardNext:eligible%5,projects:projects.data,requests:requests.data,qualifications:qualified.data};
}
export async function feedbackQueue(db:any,userId:string){
 const r=await db.from('feedback_requests').select('id,project_slug,created_at').eq('status','queued').neq('user_id',userId).order('created_at').limit(50);
 if(r.error)throw r.error;if(!r.data.length)return [];
 const projects=await db.from('projects').select('slug,title,summary,category,preview_public_url,owner_user_id').in('slug',r.data.map((x:any)=>x.project_slug)).eq('listing_status','published');
 if(projects.error)throw projects.error;
 return r.data.map((x:any)=>({...x,project:projects.data.find((p:any)=>p.slug===x.project_slug)})).filter((x:any)=>x.project&&x.project.owner_user_id!==userId).slice(0,20);
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
