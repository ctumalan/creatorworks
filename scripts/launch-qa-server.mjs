// Local-only visual fixtures. No authentication bypass is added to the application.
import http from 'node:http';
import {contentSecurityPolicy} from '../src/server/content-security-policy.mjs';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';
import {randomUUID} from 'node:crypto';
import * as policy from '../src/server/feedback-policy.mjs';
const root=new URL('../',import.meta.url),e=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const scope=vm.createContext({...policy,e,randomUUID,Response,URL,Date});
for(const file of ['src/server/feedback-ui.ts','src/server/conversation.ts']){
 const source=(await readFile(new URL(file,root),'utf8')).replace(/^import .*;\n/gm,'').replace(/^export \{.*\};\n/gm,'').replaceAll('export ','');
 vm.runInContext(stripTypeScriptTypes(source),scope);
}
const id='11111111-1111-4111-8111-111111111111',owner='22222222-2222-4222-8222-222222222222',author='33333333-3333-4333-8333-333333333333';
const tables={creator_feedback:[{id,project_slug:'test-app',author_user_id:author,helpful:'not_yet',price:'free',attempt:'stuck',focus:'ease',visibility:'private',moderation_status:'pending',message:'I tried adding a grocery list but could not find the save button.',created_at:new Date().toISOString()}],projects:[{slug:'test-app',title:'Grocery planner',owner_user_id:owner}],profiles:[{user_id:owner,display_name:'Sample Creator'},{user_id:author,display_name:'Sample Reviewer'}],feedback_replies:[],feedback_qualifications:[{feedback_id:id,status:'qualified',reason:'Original firsthand feedback'}],feedback_ratings:[]};
const db={from(table){let rows=[...(tables[table]||[])];const q={select(){return q},eq(k,v){rows=rows.filter(r=>r[k]===v);return q},in(k,v){rows=rows.filter(r=>v.includes(r[k]));return q},order(){return q},range(){return q},maybeSingle:async()=>({data:rows[0]||null}),then(resolve){return Promise.resolve({data:rows,count:rows.length}).then(resolve)}};return q}};
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');let body,type='text/html';
  if(url.pathname==='/qa/preview'){
   const source=await readFile(new URL('app.js',root),'utf8');
   const fixture=vm.createContext({esc:e,listingDraft:{title:'Grocery planner',url:'https://example.com',category:'Family life',stage:'Ready for a first try',does:'Organizes groceries for your whole family',helps:'Keeps shopping simple and avoids forgotten ingredients',firstTry:'Create your first shared shopping list'},listingUrl:x=>x,listingImage:()=>'/assets/previews/stackscout.png',queueMicrotask:()=>{},listingImageControls:()=>''});
   vm.runInContext(source.slice(source.indexOf('function listingPreview()'),source.indexOf('function listingSettingsPage()')),fixture);
   body=(await readFile(new URL('index.html',root),'utf8')).replace('<main id="app" tabindex="-1"></main>',`<main><section class="page-shell listing-review"><h1>Preview your listing.</h1><p>Visual fixture using the actual preview renderer.</p>${fixture.listingPreview()}</section></main>`).replace('<script src="app.js"></script>','');
  }
  else if(url.pathname==='/qa/messages')body=await scope.surface('Messages',`<h1>Messages</h1><p>Visual test fixture — no real users or messages.</p><div class="cw-messages"><aside class="cw-panel cw-message-list"><a aria-current="page"><strong>● Grocery planner</strong><small>Sample Reviewer</small>I tried adding a grocery list…</a></aside><div>${await scope.conversation(db,owner,id,url)}</div></div>`,'messages',200,true).text();
  else if(url.pathname==='/qa/admin')body=await scope.adminSurface('Project review','<h1>Project review</h1><section class="admin-card"><h2>Listings awaiting review</h2><p>Visual fixture for consistent admin navigation.</p></section>','projects').text();
  else if(url.pathname==='/migration'){body=await readFile(new URL('database/014_review_rewards_inbox.sql',root));type='text/plain';}
  else{
   const path=url.pathname==='/'?'index.html':url.pathname.slice(1);
   if(path.includes('..')||!(/^(assets\/|projects\/)/.test(path)||/^[\w-]+\.(html|js|css)$/.test(path)))throw Error('Not found');
   body=await readFile(new URL(path,root));
   type=path.endsWith('.woff2')?'font/woff2':path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':path.endsWith('.svg')?'image/svg+xml':path.endsWith('.png')?'image/png':path.endsWith('.jpg')?'image/jpeg':'text/html';
  }
  res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store','Content-Security-Policy':contentSecurityPolicy});res.end(body);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(Number(process.env.CW_QA_PORT||4323),'127.0.0.1',()=>console.log('Local visual fixtures ready.'));
