export function communityProgress(credit:{balance:number;towardNext:number;eligible:number}){
 const completed=Math.max(0,Math.min(4,Math.floor(credit.towardNext)));
 const remaining=5-completed;
 return `<section class="cw-panel community-progress slot-progress" aria-labelledby="slot-progress-title">
 <p class="eyebrow">Your next milestone</p>
 <h2 id="slot-progress-title">Unlock another project slot</h2>
 <p>Leave a qualifying review for <strong>5 different creators</strong> to earn space for another project.</p>
 <div class="slot-progress-status"><strong>${completed} of 5 creators helped</strong><span>${remaining} more to unlock</span></div>
 <div class="slot-progress-track" role="progressbar" aria-label="Creators helped toward your next project slot" aria-valuemin="0" aria-valuemax="5" aria-valuenow="${completed}" aria-valuetext="${completed} of 5 creators helped; ${remaining} more to unlock another project slot">${Array.from({length:5},(_,i)=>`<span class="${i<completed?'is-complete':''}" aria-hidden="true"></span>`).join('')}</div>
 <div class="slot-progress-endpoints"><span>Start helping</span><strong>5 creators → +1 project slot</strong></div>
 <p class="slot-progress-next"><strong>Next step:</strong> ${completed?'Help a different creator':'Try another creator’s project'} and review what you tried, what worked, or what stopped you.</p>
 <div class="slot-progress-footer"><a class="primary-button" href="/dashboard/community">${completed?'Help the next creator':'Find a project to review'}</a><span><strong>${credit.balance}</strong> feedback ${credit.balance===1?'credit':'credits'} available · <a href="/dashboard/community#credit-rules">How credits work</a></span></div>
 <p class="cw-meta slot-progress-note">Each creator counts once. Every 5 creators helped unlocks another slot. Bonus and referral credits don’t advance this goal.</p>
 </section>`;
}
