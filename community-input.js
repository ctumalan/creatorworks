document.addEventListener('input',event=>{
 const field=event.target.closest('[data-community-field]');if(!field)return;
 const count=(field.value.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu)||[]).length;
 const output=document.getElementById(field.dataset.counterId);if(output){output.textContent=`Word count: ${count}`;output.classList.toggle('invalid',count>0&&(count<7||count>150));if(!output.nextElementSibling?.classList.contains('word-rules')){const rules=document.createElement('small');rules.className='word-rules';rules.textContent='Minimum: 7 words · Maximum: 150 words';output.after(rules);}}
 field.setCustomValidity(count>=7&&count<=150?'':'Write 7–150 words.');
});
document.querySelectorAll('[data-community-field]').forEach(field=>field.dispatchEvent(new Event('input',{bubbles:true})));
const dashboardMenu=document.querySelector('.cw-dashboard-menu');
if(dashboardMenu){const narrow=matchMedia('(max-width:760px)');const adapt=()=>{dashboardMenu.open=!narrow.matches;};adapt();narrow.addEventListener('change',adapt);}
const revealCreditRules=()=>{if(location.hash==='#credit-rules'){const rules=document.getElementById('credit-rules');if(rules)rules.open=true;}};
revealCreditRules();addEventListener('hashchange',revealCreditRules);
document.querySelectorAll('[data-mark-thread-read]').forEach(form=>{
 fetch(form.action,{method:'POST',body:new URLSearchParams(new FormData(form)),credentials:'same-origin'}).catch(()=>{});
});
document.addEventListener('change',event=>{
 if(event.target.name!=='attempt')return;
 const prompt=document.querySelector('[data-review-prompt]');
 if(prompt)prompt.textContent=event.target.value==='not_tried'?'What would you like to ask? (No automatic credit until you try it.)':['stuck','blocked'].includes(event.target.value)?'What were you trying to do, and what stopped you?':'What did you try, and what happened?';
});
