window.CWAccountMenu = {
 mount(session) {
  document.querySelectorAll('[data-account-nav], .profile-button').forEach(anchor => {
   if (!session.authenticated) { anchor.textContent='Sign in'; return; }
   let root=anchor.closest('.account-menu');
   if(!root){root=document.createElement('details');root.className='account-menu';anchor.replaceWith(root);}
   root.replaceChildren();
   const summary=document.createElement('summary');summary.className='account-avatar';summary.setAttribute('aria-label','Open my account menu');
   if(session.user.avatar){const img=document.createElement('img');img.src=session.user.avatar;img.alt='';summary.append(img);}else summary.textContent=(session.user.displayName||'M').slice(0,1).toUpperCase();
   const panel=document.createElement('div');panel.className='account-menu-panel';
   const name=document.createElement('strong');name.textContent=session.user.displayName;panel.append(name);
   const links=[['View profile',session.user.isPublic?'/people/'+encodeURIComponent(session.user.slug):'/dashboard/profile'],['My dashboard','/dashboard/overview'],['Account settings','/dashboard/security'],['Contact us','/dashboard/help'],['Help','/dashboard/help']];
   if(session.isAdmin)links.push(['Administration','/admin/workspace']);
   for(const [text,href] of links){const a=document.createElement('a');a.href=href;a.textContent=text;panel.append(a);}
   const form=document.createElement('form');form.method='post';form.action='/auth/sign-out';const button=document.createElement('button');button.textContent='Log out';form.append(button);panel.append(form);
   root.append(summary,panel);
  });
  document.querySelectorAll('[data-guest-listing]').forEach(el=>el.hidden=!!session.authenticated);
 }
};
document.addEventListener('click',event=>document.querySelectorAll('.account-menu[open]').forEach(el=>{if(!el.contains(event.target))el.open=false;}));
document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelectorAll('.account-menu[open]').forEach(el=>{el.open=false;el.querySelector('summary').focus();});});
(async () => {
  try {
    const r = await fetch('/api/me'); if (!r.ok) return; const session = await r.json();
    window.CWAccountMenu.mount(session);
    if (session.authenticated && session.databaseReady && location.pathname === '/dashboard') {
      let draft; try { draft = JSON.parse(localStorage.getItem('creatorworks-listing-draft-v1') || '{}'); } catch {}
      if (draft?.title?.trim() && draft?.url?.trim() && !draft.serverId && (!draft.accountOwner || draft.accountOwner === session.user.id)) {
        const notice = document.createElement('p'); notice.className = 'cw-notice'; notice.setAttribute('role','status'); notice.textContent = 'Saving your project draft to your account…'; document.querySelector('main')?.prepend(notice);
        try {
          draft.clientToken ||= crypto.randomUUID(); localStorage.setItem('creatorworks-listing-draft-v1', JSON.stringify(draft));
          const saved = await fetch('/api/projects', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'save',clientToken:draft.clientToken,title:draft.title,url:draft.url,does:draft.does,helps:draft.helps,firstTry:draft.firstTry,category:draft.category,stage:draft.stage,video:draft.video})});
          const result = await saved.json(); if(!saved.ok || !result.project) throw new Error();
          Object.assign(draft,{serverId:result.project.id,serverSlug:result.project.slug,serverStatus:result.project.status,accountOwner:session.user.id,imported:'yes'});
          localStorage.setItem('creatorworks-listing-draft-v1',JSON.stringify(draft));
          location.replace('/dashboard?view=creator');
        } catch { notice.innerHTML = 'Your draft is still saved on this device. <a href="/?listing=settings">Continue saving your project</a>.'; }
      }
    }
    document.querySelectorAll('[data-guest-listing]').forEach(el => { el.hidden = !!session.authenticated; });
  } catch {}
})();
