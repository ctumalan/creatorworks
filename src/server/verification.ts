export const VERIFICATION_CREDITS=50;
export type VerificationProgress={earned:number;hasPublished:boolean;verified:boolean;caseId:string|null;eligible:boolean};
export async function verificationProgress(db:any,userId:string):Promise<VerificationProgress>{
 const r=await db.rpc('cw_verification_progress',{p_user:userId});
 if(r.error||!r.data?.[0])throw Error('Verification progress unavailable');
 const s=r.data[0],earned=Number(s.earned);
 return {earned,hasPublished:s.has_published,verified:s.verified,caseId:s.case_id,eligible:earned>=VERIFICATION_CREDITS&&s.has_published};
}
export function verificationCard(s:VerificationProgress){
 const value=Math.min(VERIFICATION_CREDITS,s.earned),remaining=Math.max(0,VERIFICATION_CREDITS-s.earned);
 const title=s.verified?'You’re a Verified Creator':s.caseId?'Your verification review is pending':s.eligible?'Your verification review is unlocked':'Become a Verified Creator';
 return `<section class="cw-panel community-progress slot-progress verification-progress" aria-labelledby="verification-title">
 <p class="eyebrow">Creator milestone</p><h2 id="verification-title">${title}</h2>
 ${s.verified?'<p>Your creator identity and connection to your work have been reviewed and approved.</p>':`
 <p>Earn <strong>50 lifetime credits</strong> and publish an approved project to unlock verification review.</p>
 <div class="slot-progress-status"><strong>${s.earned} / 50 credits earned</strong><span>${remaining?`${remaining} more to unlock`:'Credit goal reached'}</span></div>
 <progress class="verification-meter" max="50" value="${value}" aria-label="Lifetime earned credits toward verification review" aria-valuetext="${s.earned} of 50 lifetime credits earned">${value} / 50</progress>
 <ul class="verification-checklist"><li>${remaining?'○':'✓'} Earn 50 lifetime credits</li><li>${s.hasPublished?'✓':'○'} Publish your first approved project</li><li>${s.caseId?'◷ Review requested — awaiting a decision':'○ Complete identity and project ownership review'}</li></ul>
 <p class="cw-meta">Spending credits doesn’t reduce this progress. Review rewards, including bonuses, count. Invalid rewards that are reversed no longer count.</p>
 <a class="primary-button" href="${s.caseId?'/dashboard/help?case='+s.caseId:s.eligible?'/dashboard/verification':remaining?'/dashboard/community#review-projects':'/dashboard?view=creator'}">${s.caseId?'View your review request':s.eligible?'Request verification review':remaining?'Earn credits by reviewing':'Publish a project'}</a>`}
 <p class="cw-meta slot-progress-note">The badge follows approval. It confirms identity and connection to your work, not product quality or safety.</p></section>`;
}
