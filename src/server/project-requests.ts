import {randomUUID} from 'node:crypto';
import {e} from './feedback-ui';
export async function requestState(db:any,user:string,slugs:string[]){
 const [totals,requests]=await Promise.all([db.rpc('cw_credit_totals',{p_user:user}),slugs.length?db.from('feedback_requests').select('id,project_slug').eq('user_id',user).eq('status','queued').in('project_slug',slugs):Promise.resolve({data:[],error:null})]);
 if(totals.error||requests.error)throw Error('Request status unavailable');
 return (p:any)=>({...p,feedbackBalance:Number(totals.data?.[0]?.balance||0),feedbackRequest:requests.data.find((r:any)=>r.project_slug===p.slug)?.id||''});
}
export function feedbackRequestAction(p:any){
 if(p.listing_status!=='published')return '<span class="cw-meta">Publish before requesting feedback</span>';
 if(p.feedbackBalance===undefined)return '<a href="/dashboard?view=creator">Request feedback · 1 credit</a>';
 const cancel=!!p.feedbackRequest;
 return `<form method="post" action="/api/community-credits" data-credit-request><input type="hidden" name="id" value="${e(p.feedbackRequest||randomUUID())}"><input type="hidden" name="slug" value="${e(p.slug)}"><input type="hidden" name="action" value="${cancel?'cancel':'create'}"><input type="hidden" name="returnTo" value="projects"><button ${!cancel&&p.feedbackBalance<1?'disabled':''}>${cancel?'Cancel request · return 1 credit':'Request feedback · 1 credit'}</button>${!cancel&&p.feedbackBalance<1?'<small>Earn a credit by reviewing first.</small>':''}</form>`;
}
