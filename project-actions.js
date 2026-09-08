document.addEventListener('click',async event=>{
 const play=event.target.closest('[data-load-video]');if(play){const url=CWMedia.videoUrl(play.dataset.loadVideo);if(url){const frame=document.createElement('iframe');frame.src=url;frame.title='Project video';frame.allow='fullscreen; picture-in-picture';frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-presentation');frame.setAttribute('allowfullscreen','');frame.referrerPolicy='strict-origin-when-cross-origin';play.parentElement.replaceChildren(frame);}return;}
 const button=event.target.closest('[data-save-public]');if(!button)return;
 const status=button.closest('article,section').querySelector('[data-save-status]');button.disabled=true;
 try{const me=await fetch('/api/me').then(r=>r.json());if(!me.authenticated){location.href='/auth/sign-in?next='+encodeURIComponent(location.pathname);return;}
 const r=await fetch('/api/saved',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug:button.dataset.savePublic,saved:button.dataset.saved!=='true'})});if(!r.ok)throw Error();button.dataset.saved=button.dataset.saved==='true'?'false':'true';button.textContent=button.dataset.saved==='true'?'♥ Saved':'♡ Save';if(status)status.textContent=button.dataset.saved==='true'?'Saved to your dashboard.':'Removed from saved projects.';
 }catch{if(status)status.textContent='That change could not be saved. Please try again.';}finally{button.disabled=false;}
});

fetch('/api/saved').then(r=>r.ok?r.json():null).then(data=>{if(!data)return;document.querySelectorAll('[data-save-public]').forEach(button=>{const saved=data.saved.includes(button.dataset.savePublic);button.dataset.saved=String(saved);button.textContent=saved?'♥ Saved':'♡ Save';});}).catch(()=>{});
// Release notes contain creator text; insert it as text, never HTML.
if(location.pathname.startsWith('/projects/')&&document.querySelector('.recipient-answers')){
 const slug=location.pathname.split('/')[2];
 fetch('/api/builds/'+encodeURIComponent(slug)).then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{
  if(!data.events.length)return;
  const section=document.createElement('section');section.className='cw-panel';section.id='build-updates';
  const heading=document.createElement('h2');heading.textContent='Builds & improvements';section.append(heading);
  const current=data.builds.find(b=>b.id===data.active),label=document.createElement('p');label.textContent='Active build: '+(current?.version||'Not selected');section.append(label);
  for(const event of [...data.events].reverse()){
   const build=data.builds.find(b=>b.id===event.buildId);if(!build)continue;
   const item=document.createElement('article');item.id='build-'+event.id;
   const title=document.createElement('h3');title.textContent='Build '+build.version;
   const date=document.createElement('p');date.className='cw-meta';date.textContent='Activated '+new Date(event.createdAt).toLocaleDateString();
   const notes=document.createElement('p');notes.textContent=build.notes;item.append(title,date,notes);section.append(item);
  }
  document.querySelector('.recipient-answers').after(section);
  if(/^#build-[0-9a-f-]+$/.test(location.hash))document.getElementById(location.hash.slice(1))?.scrollIntoView();
 }).catch(()=>{});
}
