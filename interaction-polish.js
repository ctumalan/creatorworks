// Progressive enhancement: controls remain usable without motion or browser storage.
(() => {
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 window.CWGuestComment={offer(status){const box=document.createElement('div');box.className='guest-comment-followup';box.innerHTML='<p>Sign up to get an in-site notification when your comment is published.</p><button type="button" class="secondary-button" data-comment-updates>Sign up for updates</button><button type="button" data-dismiss-comment-updates>Not now</button><small>Use this browser within 7 days. No email is sent.</small>';status.append(box);}};
 document.addEventListener('click',async event=>{const dismiss=event.target.closest('[data-dismiss-comment-updates]');if(dismiss){dismiss.closest('.guest-comment-followup').remove();return;}const button=event.target.closest('[data-comment-updates]');if(!button)return;button.disabled=true;try{const r=await fetch('/api/comment-updates',{method:'POST'}),data=await r.json();if(!r.ok)throw Error(data.error);location.href=data.href;}catch(error){button.disabled=false;button.closest('.guest-comment-followup').querySelector('small').textContent=error.message||'Please try again.';}});
 const grow=field=>{if(!field?.matches?.('textarea')||!field.getClientRects().length)return;const y=window.scrollY;field.style.height='auto';const h=Math.min(280,Math.max(56,field.scrollHeight+2));field.style.height=h+'px';field.style.overflowY=field.scrollHeight>h?'auto':'hidden';if(window.scrollY!==y)window.scrollTo(0,y);};
 const scan=root=>{if(root.matches?.('textarea'))grow(root);root.querySelectorAll?.('textarea').forEach(grow);};
 document.addEventListener('input',event=>grow(event.target));
 document.addEventListener('reset',event=>requestAnimationFrame(()=>scan(event.target)));
 document.addEventListener('toggle',event=>{if(event.target.open)requestAnimationFrame(()=>scan(event.target));},true);
 let pending=false;const refresh=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;scan(document);});};
 new MutationObserver(refresh).observe(document.body,{childList:true,subtree:true});window.addEventListener('resize',refresh);scan(document);
 try{if(!localStorage.getItem('trymybuild-brand-intro')){localStorage.setItem('trymybuild-brand-intro','seen');if(!reduced()){const brand=document.querySelector('.site-header .brand, .cw-bar .cw-brand');brand?.classList.add('brand-intro');setTimeout(()=>brand?.classList.remove('brand-intro'),650);}}}catch{}
 document.addEventListener('click',event=>{
  const summary=event.target.closest('.catalog-filter-menu>summary');if(!summary)return;
  const details=summary.parentElement,content=details.querySelector('.catalog-filter-options');
  if(reduced()||!content)return;event.preventDefault();
  if(details.dataset.animating)return;
  if(details.open){details.dataset.animating='true';content.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-6px)'}],{duration:180,easing:'ease-in'}).finished.finally(()=>{details.open=false;delete details.dataset.animating;});}
  else{details.open=true;content.animate([{opacity:0,transform:'translateY(-6px)'},{opacity:1,transform:'translateY(0)'}],{duration:200,easing:'ease-out'});}
 });
})();
