/* Homepage journeys. Drafts remain on this device until explicitly submitted. */
let communityWishes = [];
let wishesLoaded = false;
function sharingPreferenceFields() {
 const preference=listingDraft.sharingPreference || 'not_sure';
 return `<fieldset class="sharing-preference"><legend>How would you like to share your app?</legend><div>${[['private','Privately'],['public','Publicly'],['not_sure','Not sure yet']].map(([value,label])=>`<label><input type="radio" name="sharingPreference" data-sharing-preference value="${value}" ${preference===value?'checked':''}>${label}</label>`).join('')}</div><p data-sharing-note>${sharingPreferenceNote(preference)}</p></fieldset>`;
}
function sharingPreferenceNote(preference) {
 if(['published','in_review'].includes(listingDraft.serverStatus))return 'This preference does not change your existing publication status. Use Unpublish or Withdraw from review in project settings to take the listing out of public review or discovery.';
 return preference==='public'?'When you’re ready, submit your listing for public review. This choice does not publish it.':preference==='private'?'Keep your listing out of the public catalog. You can share your own app link with people you choose; its access settings are controlled by your app.':'Keep a private draft and decide later.';
}
function membershipPromo() {
 return `<section class="membership-promo" id="home-community"><p class="eyebrow">Free to join. Better together.</p><h2>Build better. Discover more. Help each other.</h2><ol>${[
 ['Get real feedback','Invite friends and community members to try your app and share what could improve.'],
 ['Earn community credits','Earn credits for qualifying reviews, with bonuses when creators recognize your help.'],
 ['Grow your presence','Unlock additional project slots through consistent, useful contributions.'],
 ['Keep your favorites close','Save useful apps and opt in to notifications about new ones matching your interests.'],
 ['Inspire what gets built next','Share a wish—or turn someone’s need into your next project.']
 ].map(([title,copy])=>`<li><strong>${title}</strong><p>${copy}</p></li>`).join('')}</ol><div class="promo-actions">${state.session?.authenticated?'<a class="primary-button" href="/dashboard/community">Your community credits</a>':'<button class="primary-button" data-route="account">Create my free account</button>'}<a href="/dashboard/community#credit-rules">How feedback credits work →</a></div></section>`;
}
function aboutPage() {
 return `<section class="page-shell">${homeViewTabs(homeView)}<article class="public-info founder-info"><p class="eyebrow">About TryMyBuild</p><h1>Useful ideas deserve a place to grow.</h1><div class="founder-story"><img class="founder-photo" src="/assets/avatars/chris-nava-founder.jpg" alt="Chris Nava, founder of TryMyBuild, in his recording studio" width="1084" height="971"><div><h2>Chris Nava · Founder</h2><p>TryMyBuild was founded by Chris Nava, a Grammy-winning musician with a curiosity for building useful things. After creating his own apps using rapidly evolving AI tools, Chris wanted a place to share his work, hear honest feedback, and help others do the same. TryMyBuild grew from that need: a community where people discover useful apps, creators learn from real users, and everyday problems inspire what gets built next.</p><button class="text-button" data-route="contact">Get in touch →</button></div></div></article>${homeHowItWorks()}</section>`;
}
function contactPage() {
 return `<section class="page-shell">${homeViewTabs(homeView)}<article class="public-info"><p class="eyebrow">Contact</p><h1>Have a question?</h1><p>You don’t need an account to get in touch.</p><a class="primary-button" href="mailto:hello@trymybuild.com">hello@trymybuild.com</a><p class="privacy-note">Opens your email app. Please don’t send passwords or sensitive account details.</p>${state.session?.authenticated?'<a href="/dashboard/help">View your support requests →</a>':'<p>Already a member? <a href="/dashboard/help">Sign in to track a support request.</a></p>'}</article></section>`;
}
document.addEventListener('change',event=>{
 if(!event.target.matches('[data-sharing-preference]'))return;
 listingDraft.sharingPreference=event.target.value;saveListingDraft();
 event.target.closest('fieldset').querySelector('[data-sharing-note]').textContent=sharingPreferenceNote(event.target.value);
});
const creatorQuotes=[
 {text:'The feedback you get from engaging directly with your earliest users will be the best you ever get.',author:'Paul Graham',source:'https://paulgraham.com/ds.html'},
 {text:'focus on the user’s problem rather than possible solutions',author:'GOV.UK Service Manual',source:'https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs'},
 {text:"You miss 100% of the shots you don't take",author:'Wayne Gretzky'}
];
let quoteIndex=0,quoteDismissed=false,quoteFormActive=false,quoteTimer=null,activeQuoteCard=null;
const pendingQuotes=[];
const shownQuoteIndexes=new Set();
function syncQuoteVisibility() {
 const active=!!document.querySelector('[data-inline-listing]');
 if(active&&!quoteFormActive){shownQuoteIndexes.clear();quoteDismissed=false;}
 if(!active){clearTimeout(quoteTimer);activeQuoteCard?.remove();activeQuoteCard=null;pendingQuotes.length=0;}
 quoteFormActive=active;
}
function quoteCardContent(){const q=creatorQuotes[quoteIndex];return `<button class="quote-dismiss" type="button" data-quote-dismiss aria-label="Dismiss inspiration">×</button><blockquote>“${q.text}”</blockquote>${q.source?`<a href="${q.source}" target="_blank" rel="noopener noreferrer">${q.author} · Source</a>`:`<span>${q.author}</span>`}`;}
function showCreatorQuote(index){
 quoteIndex=index;
 const card=document.createElement('aside');card.className='creator-quote';card.setAttribute('aria-label','Inspiration for creators');card.innerHTML=quoteCardContent();
 activeQuoteCard=card;document.body.append(card);
 quoteTimer=setTimeout(()=>{
  card.remove();activeQuoteCard=null;
  if(pendingQuotes.length&&!quoteDismissed&&quoteFormActive)showCreatorQuote(pendingQuotes.shift());
 },10000);
}
function requestCreatorQuote(index){
 if(quoteDismissed||shownQuoteIndexes.has(index))return;
 shownQuoteIndexes.add(index);
 if(index===1)shownQuoteIndexes.add(0);
 if(activeQuoteCard){pendingQuotes.push(index);return;}
 showCreatorQuote(index);
}
document.addEventListener('input',event=>{
 if(!event.target.matches('[data-inline-listing] [data-listing-field]')||!event.target.value.trim()||event.target.dataset.listingField==='stage')return;
 requestCreatorQuote(event.target.dataset.listingField==='helps'?1:0);
});
document.addEventListener('change',event=>{
 if(event.target.matches('[data-inline-listing] select[data-listing-field="stage"]')&&event.target.value)requestCreatorQuote(2);
});
document.addEventListener('click',event=>{
 if(event.target.closest('[data-quote-dismiss]')){quoteDismissed=true;clearTimeout(quoteTimer);pendingQuotes.length=0;activeQuoteCard?.remove();activeQuoteCard=null;}
});
function inlineListingForm() {
 return `<section class="inline-listing"><h1>Get your app tested by close friends or community members.</h1><p>Listing your project is free. Your drafts stay private until you’re ready to publish.</p><form data-listing-step data-inline-listing>${sharingPreferenceFields()}${listingField('title','Project name','Your app name')}${listingField('url','Project link','https://your-project.com')}<details class="listing-details" open><summary>Tell people what to try</summary>${listingField('does','What does your project do?','Describe it in 4–10 words',true)}${listingField('helps','How does it help people?','Describe the benefit in 4–10 words',true)}${listingField('firstTry','What should someone try first?','Suggest a task in 4–10 words',true)}${listingCategoryPicker()}<label>Project stage<select data-listing-field="stage">${['Still taking shape','Ready for a first try','Being tested by early users','Finished and launched'].map(stage=>`<option ${listingDraft.stage===stage?'selected':''}>${stage}</option>`).join('')}</select></label></details><button type="submit" class="primary-button">Preview my listing</button><p data-listing-status role="status"></p><p>Nothing is published until you submit it for review.</p></form></section>`;
}
function welcomeAccountPage() {
 let selected=[],alerts=false;try{selected=JSON.parse(localStorage.getItem('trymybuild-signup-interests')||'[]');alerts=localStorage.getItem('trymybuild-signup-alerts')==='true';}catch{}
 return `<section class="page-shell">${homeViewTabs(homeView)}<section class="welcome-account"><h1>Welcome to TryMyBuild.</h1><p>Create your account to save useful projects and receive notifications when new apps match your interests.</p><form data-welcome-signup><fieldset><legend>What interests you? <small>Click as many as you want</small></legend><div class="interest-options">${categoryCatalog.map(c=>`<label><input type="checkbox" name="interest" value="${esc(c.name)}" ${selected.includes(c.name)?'checked':''}>${esc(c.name)}</label>`).join('')}</div></fieldset><label><input type="checkbox" name="alerts" ${alerts?'checked':''}> Notify me about new apps matching these interests</label><label class="legal-agreement"><input type="checkbox" required><span>I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.</span></label><button class="primary-button">Create my account</button><a href="/auth/sign-in">Already a member? Sign in</a><p data-signup-status role="status"></p></form><p>Are you a creator? <button class="text-button" data-home-view="test">List your project—it’s free!</button></p></section></section>`;
}
function wishListSection() {
 let draft={};try{draft=JSON.parse(localStorage.getItem('trymybuild-wish-draft')||'{}');}catch{}
 const category=state.category==='All'?(draft.category||categoryCatalog[0].name):state.category;
 const description=draft.description||state.query||'';
 const wishes=communityWishes.filter(w=>state.category==='All'||w.category===state.category);
 return `<section class="wish-list" id="wish-list"><h2>${state.category==='All'?'Community':esc(state.category)} wish list</h2><p>Real needs. Ideas worth building. What do you wish an app could do?</p><label>Explore wishes by category<select data-wish-category-filter><option value="All">All categories</option>${categoryCatalog.map(c=>`<option ${state.category===c.name?'selected':''}>${esc(c.name)}</option>`).join('')}</select></label><div class="wish-items">${wishes.map(w=>`<article><small>${esc(w.category)}</small><p>${esc(w.description)}</p></article>`).join('')||`<p>${wishesLoaded?'No wishes here yet. Share the first idea.':(window.CW_SERVER?'Wish lists are temporarily unavailable. Please try again later.':'Community wishes are not connected in this preview yet.')}</p>`}</div><form data-wish-form><label>Category<select name="category" required>${categoryCatalog.map(c=>`<option ${category===c.name?'selected':''}>${esc(c.name)}</option>`).join('')}</select></label><label>What should the app do?<textarea name="description" rows="2" maxlength="180" required placeholder="Describe your wish in 4–11 words">${esc(description)}</textarea></label><small data-wish-count>${commentWordCount(description)} / 4–11 words</small><button class="primary-button">Submit my wish</button><p data-wish-status role="status"></p></form></section>`;
}
document.addEventListener('click',event=>{if(event.target.closest('[data-wish-focus]')){document.querySelector('[data-wish-form] textarea')?.focus();}});
document.addEventListener('change',event=>{if(event.target.matches('[data-wish-category-filter]')){state.category=event.target.value;renderMenuChange('[data-wish-category-filter]');}});

document.addEventListener('change',event=>{
 const form=event.target.closest('[data-welcome-signup]');
 if(form){try{localStorage.setItem('trymybuild-signup-interests',JSON.stringify(new FormData(form).getAll('interest')));localStorage.setItem('trymybuild-signup-alerts',String(form.elements.alerts.checked));}catch{}}
 const wish=event.target.closest('[data-wish-form]');
 if(wish){try{localStorage.setItem('trymybuild-wish-draft',JSON.stringify({category:wish.elements.category.value,description:wish.elements.description.value}));}catch{}}
});
document.addEventListener('cw:account-ready',async event=>{
 if(!event.detail?.authenticated)return;
 try{
  if(localStorage.getItem('trymybuild-signup-pending')!=='1')return;
  const r=await fetch('/api/onboarding',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({interests:JSON.parse(localStorage.getItem('trymybuild-signup-interests')||'[]'),alerts:localStorage.getItem('trymybuild-signup-alerts')==='true'})});
  if(!r.ok)throw Error();
  localStorage.removeItem('trymybuild-signup-pending');
 }catch{const note=document.createElement('p');note.setAttribute('role','status');note.textContent='Your account is ready, but your interests could not be saved. You can update them in account preferences.';document.querySelector('main')?.prepend(note);}
});
document.addEventListener('input',event=>{
 const form=event.target.closest('[data-wish-form]');if(!form)return;
 const description=form.elements.description.value,count=commentWordCount(description);
 form.querySelector('[data-wish-count]').textContent=`${count} / 4–11 words`;
 form.elements.description.setCustomValidity(count>=4&&count<=11?'':'Use 4–11 words.');
 try{localStorage.setItem('trymybuild-wish-draft',JSON.stringify({category:form.elements.category.value,description}));}catch{}
});
document.addEventListener('submit',async event=>{
 const signup=event.target.closest('[data-welcome-signup]');
 if(signup){event.preventDefault();try{localStorage.setItem('trymybuild-signup-interests',JSON.stringify(new FormData(signup).getAll('interest')));localStorage.setItem('trymybuild-signup-alerts',String(signup.elements.alerts.checked));localStorage.setItem('trymybuild-signup-pending','1');}catch{}if(!window.CW_SERVER){signup.querySelector('[data-signup-status]').textContent='Account creation is available on the connected site. Your choices are saved locally.';return;}location.href='/auth/sign-in?signup=1&next='+encodeURIComponent('/?welcome=1');return;}
 const form=event.target.closest('[data-wish-form]');if(!form)return;event.preventDefault();
 const category=form.elements.category.value,description=form.elements.description.value.trim(),status=form.querySelector('[data-wish-status]'),count=commentWordCount(description);
 if(count<4||count>11){status.textContent='Describe your wish in 4–11 words.';return;}
 try{localStorage.setItem('trymybuild-wish-draft',JSON.stringify({category,description}));}catch{status.textContent='Your draft could not be saved. Enable browser storage before continuing.';return;}
 if(!window.CW_SERVER){status.textContent='Your wish is saved as a local draft. Public submission is available on the connected site.';return;}
 if(!state.session?.authenticated){location.href='/auth/sign-in?signup=1&next='+encodeURIComponent('/?wish=1#wish-list');return;}
 const button=form.querySelector('button');button.disabled=true;
 try{const response=await fetch('/api/wishes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({category,description})});const data=await response.json();if(!response.ok)throw Error(data.error||'Unable to submit wish.');localStorage.removeItem('trymybuild-wish-draft');form.reset();status.textContent='Your wish is published. Thank you for sharing a real need.';await loadCommunityWishes();}catch(error){status.textContent=error.message;}finally{button.disabled=false;}
});
async function loadCommunityWishes(){if(!window.CW_SERVER)return;try{const r=await fetch('/api/wishes');if(!r.ok)return;const data=await r.json();communityWishes=data.wishes;wishesLoaded=true;const section=document.getElementById('wish-list');if(section){const template=document.createElement('template');template.innerHTML=wishListSection();section.replaceWith(template.content.firstElementChild);}}catch{}}
document.addEventListener('DOMContentLoaded',async()=>{
 await loadCommunityWishes();
 const page=new URLSearchParams(location.search).get('page');if(['about','contact'].includes(page)){state.route=page;render();}
 if(new URLSearchParams(location.search).has('welcome')){state.route='account';render();}
 if(new URLSearchParams(location.search).has('wish')){state.route='discover';homeView='find';render();document.getElementById('wish-list')?.scrollIntoView();}
});
