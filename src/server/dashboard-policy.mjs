export const caseKinds = ['support','report','copyright','appeal','verification'];
export const caseStatuses = ['open','waiting','resolved'];
export function caseInput(body) {
 const kind=body.kind,subject=String(body.subject||'').trim(),message=String(body.message||'').trim();
 const project=String(body.project||'').trim();
 if(!caseKinds.includes(kind)||subject.length<3||subject.length>120||message.length<10||message.length>4000||!/^([a-z0-9-]{1,80})?$/.test(project)) return null;
 return {kind,subject,message,project_slug:project||null};
}
export function publicWebsite(value) {
 if(!value)return '';
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&u.href.length<=1000?u.href:null;}catch{return null;}
}
export function preferences(body) {
 const interests=String(body.interests||'').split(',').map(x=>x.trim()).filter(Boolean);
 if(interests.length>10||interests.some(x=>x.length>48))return null;
 return {feedback_alerts:body.feedbackAlerts==='on',publication_alerts:body.publicationAlerts==='on',tips:body.tips==='on',interests:[...new Set(interests)]};
}
export function canManageTarget(actor, target, founder) {
 return !!actor&&actor.workos_user_id===founder&&actor.account_status==='active'&&!!target&&target.workos_user_id!==founder&&target.system_role!=='admin'&&target.account_status!=='deleted';
}
