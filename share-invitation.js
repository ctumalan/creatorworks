// A preview is always required before handing the invitation to a sharing app.
(()=>{
 const escape=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let opener;
 document.addEventListener('click',async event=>{
  const trigger=event.target.closest('[data-share-product],[data-invite-project],[data-share-profile]');if(!trigger)return;
  event.preventDefault();opener=trigger;const slug=trigger.dataset.shareProduct||trigger.dataset.inviteProject,profile=trigger.dataset.shareProfile;
  document.querySelector('.invitation-dialog')?.remove();
  const dialog=document.createElement('dialog');dialog.className='invitation-dialog';dialog.setAttribute('aria-labelledby','invite-title');
  dialog.innerHTML='<button type="button" class="invite-close" aria-label="Close invitation preview">×</button><h2 id="invite-title">Preview your invitation</h2><p role="status">Preparing the project preview…</p>';document.body.append(dialog);dialog.showModal();
  const close=()=>{dialog.close();dialog.remove();opener?.focus();};dialog.querySelector('.invite-close').onclick=close;dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  try{
   const response=await fetch(profile?'/api/profile-invitation/'+encodeURIComponent(profile):'/api/invitation/'+encodeURIComponent(slug));if(!response.ok)throw Error();const p=await response.json();if(!dialog.isConnected)return;
   const defaultText=profile?`Meet ${p.name} on TryMyBuild and explore their projects.`:`Take a look at ${p.name} on TryMyBuild. I’d love to hear what you think.`;
   dialog.innerHTML=`<button type="button" class="invite-close" aria-label="Close invitation preview">×</button><p class="eyebrow">Share something worth trying</p><h2 id="invite-title">Preview your invitation</h2><label for="invite-message">Your message</label><textarea id="invite-message" maxlength="500">${escape(defaultText)}</textarea><section class="invitation-preview" aria-label="Invitation preview"><p data-message-preview>${escape(defaultText)}</p><article>${p.image?`<img src="${escape(p.image)}" alt="Preview of ${escape(p.name)}">`:''}<div><span class="eyebrow">TryMyBuild · ${escape(p.category)}</span><h3>${escape(p.name)}</h3><p>${escape(p.description)}</p><small>Built by ${escape(p.builder)}</small><a href="${escape(p.url)}" target="_blank" rel="noopener">Preview recipient page ↗</a></div></article></section>${p.privateListing?'<p class="cw-notice">Your listing stays private. This shares only your app’s own link; its access settings are controlled by that app.</p>':''}<label for="invite-url">${profile?'Profile link':'Project link'}</label><input id="invite-url" readonly value="${escape(p.url)}"><p class="cw-meta">This is a preview of your message and project card. Each messaging app controls its link-preview appearance. Nothing has been sent.</p><details class="invitation-send-menu"><summary class="primary-button">Send invitation <span aria-hidden="true">⌄</span></summary><div class="invitation-send-options"><button type="button" data-invite-action="email">Email</button><button type="button" data-invite-action="text">Text</button><button type="button" data-invite-action="copy">${profile?'Copy link':'Copy invitation'}</button><button type="button" data-invite-action="native">More options</button></div></details><p data-invite-status role="status"></p>`;
   dialog.querySelector('.invite-close').onclick=close;
   const message=dialog.querySelector('#invite-message'),status=dialog.querySelector('[data-invite-status]');message.addEventListener('input',()=>dialog.querySelector('[data-message-preview]').textContent=message.value);
   dialog.addEventListener('click',async event=>{
    const action=event.target.closest('[data-invite-action]')?.dataset.inviteAction;if(!action)return;
    const text=message.value.trim(),body=text+'\n\n'+p.url;dialog.querySelector('.invitation-send-menu').open=false;
    try{
     if(action==='copy'){await navigator.clipboard.writeText(profile?p.url:body);status.textContent='Invitation copied. Paste it into your conversation.';}
     if(action==='native'&&!navigator.share){status.textContent='Choose Email, Text, or copy the link to use another app.';dialog.querySelector('#invite-url').select();return;}
     if(action==='native'){await navigator.share({title:p.name,text,url:p.url});status.textContent='Sharing options closed. Your app handles delivery.';}
     if(action==='email'){location.href='mailto:?subject='+encodeURIComponent('Try '+p.name)+'&body='+encodeURIComponent(body);status.textContent='Finish reviewing and send in your email app.';}
     if(action==='text'){location.href='sms:?body='+encodeURIComponent(body);status.textContent='Finish reviewing and send in your messaging app.';}
    }catch(error){if(error.name!=='AbortError'){status.textContent='Automatic sharing is unavailable. Select and copy the project link above.';dialog.querySelector('#invite-url').select();}}
   });
  }catch{dialog.querySelector('[role="status"]').textContent='This invitation is unavailable. Only public profiles and published project listings can be shared here.';}
 });
})();
