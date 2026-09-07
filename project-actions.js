document.addEventListener('click',async event=>{
 const play=event.target.closest('[data-load-video]');if(play){const url=CWMedia.videoUrl(play.dataset.loadVideo);if(url){const frame=document.createElement('iframe');frame.src=url;frame.title='Project video';frame.allow='fullscreen; picture-in-picture';frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-presentation');frame.setAttribute('allowfullscreen','');frame.referrerPolicy='strict-origin-when-cross-origin';play.parentElement.replaceChildren(frame);}return;}
 const button=event.target.closest('[data-save-public]');if(!button)return;
 const status=button.closest('article,section').querySelector('[data-save-status]');button.disabled=true;
 try{const me=await fetch('/api/me').then(r=>r.json());if(!me.authenticated){location.href='/auth/sign-in?next='+encodeURIComponent(location.pathname);return;}
 const r=await fetch('/api/saved',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug:button.dataset.savePublic,saved:button.dataset.saved!=='true'})});if(!r.ok)throw Error();button.dataset.saved=button.dataset.saved==='true'?'false':'true';button.textContent=button.dataset.saved==='true'?'♥ Saved':'♡ Save';if(status)status.textContent=button.dataset.saved==='true'?'Saved to your dashboard.':'Removed from saved projects.';
 }catch{if(status)status.textContent='That change could not be saved. Please try again.';}finally{button.disabled=false;}
});

fetch('/api/saved').then(r=>r.ok?r.json():null).then(data=>{if(!data)return;document.querySelectorAll('[data-save-public]').forEach(button=>{const saved=data.saved.includes(button.dataset.savePublic);button.dataset.saved=String(saved);button.textContent=saved?'♥ Saved':'♡ Save';});}).catch(()=>{});
