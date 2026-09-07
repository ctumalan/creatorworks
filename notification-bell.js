(()=>{
 let last=0,loading=false;
 const safeHref=href=>typeof href==='string'&&href.startsWith('/')&&!href.startsWith('//')?href:'/dashboard/notifications';
 async function refresh(){if(loading||Date.now()-last<45000||document.hidden)return;loading=true;last=Date.now();
 try{const r=await fetch('/api/notifications');if(!r.ok)return;const data=await r.json();
  document.querySelectorAll('.account-menu:not(.notification-bell)').forEach(menu=>{
   let root=menu.parentElement.querySelector('.notification-bell');if(!root){root=document.createElement('details');root.className='notification-bell account-menu';menu.before(root);}
   const wasOpen=root.open;root.replaceChildren();const summary=document.createElement('summary');summary.className='bell-button';summary.setAttribute('aria-label',`Notifications, ${data.unread} unread`);summary.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M9 21h6"/></svg>';if(data.unread){const badge=document.createElement('span');badge.className='notification-count';badge.textContent=data.unread>99?'99+':data.unread;summary.append(badge);}
   const panel=document.createElement('div');panel.className='account-menu-panel notification-panel';const heading=document.createElement('strong');heading.textContent='Your updates';panel.append(heading);
   if(!data.items.length){const p=document.createElement('p');p.textContent='You’re all caught up.';panel.append(p);}
   for(const item of data.items){const a=document.createElement('a');a.href=safeHref(item.href);a.textContent=(item.read_at?'':'● ')+item.title;a.className=item.read_at?'':'unread';a.onclick=()=>{fetch('/api/notifications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:item.id}),keepalive:true}).catch(()=>{});};panel.append(a);}
   const all=document.createElement('a');all.href='/dashboard/notifications';all.textContent='All notifications & preferences →';panel.append(all);root.append(summary,panel);root.open=wasOpen;
  });
 }catch{}finally{loading=false;}}
 document.addEventListener('cw:account-ready',event=>{if(event.detail?.authenticated)refresh();});window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);setInterval(refresh,60000);
})();
