import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {normalizeWishCategory,validWish,wishCategories} from '../src/server/wish-policy.mjs';
import {moduleFixture,mockDatabase,read} from '../scripts/workspace-fixtures.mjs';
const app=read('app.js'),entry=read('community-entry.js');
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function client(draft={}){
 const storage=new Map([['trymybuild-wish-draft',JSON.stringify(draft)]]),listeners=[];
 const ctx=vm.createContext({document:{addEventListener(type,fn){listeners.push({type,fn});},getElementById(){return null;},querySelector(){return null;}},window:{CW_SERVER:false},state:{query:'',session:null},esc:escape,commentWordCount:s=>(s.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu)||[]).length,localStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)}});
 vm.runInContext(app.slice(app.indexOf('const categoryCatalog'),app.indexOf('const state')),ctx);
 vm.runInContext(entry,ctx);
 return {ctx,storage,listeners};
}
test('wish categories accept custom names and share canonical casing, spacing, and aliases on client and server',()=>{
 const {ctx}=client();
 for(const [raw,expected] of [[' PET   care ','Pet Care'],['pet care','Pet Care'],['ＰＥＴ care','Pet Care'],['finance','Money'],['family LIFE','Family life'],['ai','AI & automation'],['Music & AUDIO','Music & audio'],...wishCategories.map(c=>[c,c])]){
  assert.equal(normalizeWishCategory(raw),expected);assert.equal(ctx.canonicalWishCategory(raw),expected);
 }
 for(const raw of [null,{},4,'','a','Other','other…','__other__','All','All categories','ADMIN','<script>','https://example.com','x'.repeat(49)]){
  assert.equal(normalizeWishCategory(raw),'');assert.equal(ctx.canonicalWishCategory(raw),'');assert.equal(validWish(raw,'Help me care for pets'),false);
 }
 assert.equal(validWish('Pet care','Help me care for pets'),true);
});
test('wish composer has exactly one category selector, including Other and a styled conditional text field',()=>{
 const {ctx}=client();const html=ctx.wishListSection();
 assert.equal((html.match(/<select\b/g)||[]).length,1);
 assert.match(html,/<select name="category" data-wish-category-filter/);
 assert.match(html,/value="All" selected/);assert.match(html,/>Other…<\/option>/);
 assert.match(html,/data-wish-custom-wrap hidden/);assert.match(html,/name="customCategory"[^>]+disabled/);
 assert.match(html,/after your wish is approved/);
 assert.match(read('ui-refinements.css'),/\.wish-list \[hidden\]\{display:none!important\}/);
});
test('custom category and wish draft survive reload or sign-in return without creating a second dropdown',()=>{
 const {ctx}=client({category:'__other__',customCategory:'Pet care',description:'Help me care for pets'});
 let html=ctx.wishListSection();assert.match(html,/value="__other__" selected/);assert.match(html,/value="Pet care" required/);assert.match(html,/>Help me care for pets<\/textarea>/);assert.doesNotMatch(html,/data-wish-custom-wrap hidden/);
 const legacy=client({category:'Climate technology',description:'Help me reduce household waste'}).ctx.wishListSection();assert.match(legacy,/value="Climate Technology" required/);
 vm.runInContext("publicWishCategories=['Pet Care','pet care','Technology','<script>']",ctx);
 html=ctx.wishListSection();assert.equal((html.match(/<option value="Pet Care" >/g)||[]).length,1);assert.doesNotMatch(html,/<script>/);
});
test('filter changes and async result refresh never reset or replace the live composer',()=>{
 const {ctx}=client();let result='';
 const results={set innerHTML(value){result=value;}};
 ctx.document.getElementById=()=>({querySelector(selector){assert.equal(selector,'.wish-items');return results;}});
 vm.runInContext("wishesLoaded=true;communityWishes=[{id:'1',category:'Pet Care',description:'Help me care for pets'}];wishCategory='Pet Care'",ctx);
 ctx.refreshWishResults();assert.match(result,/Help me care for pets/);
});
test('a slower earlier category response cannot replace the latest selection',async()=>{
 const {ctx}=client(),requests=[];ctx.window.CW_SERVER=true;
 ctx.fetch=url=>new Promise(resolve=>requests.push({url,resolve}));
 vm.runInContext("wishCategory='Technology'",ctx);const earlier=ctx.loadCommunityWishes();
 vm.runInContext("wishCategory='Pet Care'",ctx);const later=ctx.loadCommunityWishes();
 assert.match(requests[0].url,/category=Technology/);assert.match(requests[1].url,/category=Pet%20Care/);
 requests[1].resolve({ok:true,json:async()=>({wishes:[{id:'pet',category:'Pet Care'}],categories:['Pet Care']})});await later;
 requests[0].resolve({ok:true,json:async()=>({wishes:[{id:'tech',category:'Technology'}],categories:['Technology']})});await earlier;
 assert.equal(vm.runInContext('communityWishes[0].id',ctx),'pet');assert.equal(vm.runInContext('wishesLoading',ctx),false);
});
test('All categories cannot submit; Other sends a canonical category and preserves drafts on failure',async()=>{
 const {ctx,listeners,storage}=client();ctx.window.CW_SERVER=true;ctx.state.session={authenticated:true};
 const status={textContent:''},button={disabled:false},count={textContent:''};
 const field=value=>({value,setCustomValidity(value){this.error=value;},reportValidity(){},focus(){}});
 const form={elements:{category:field('All'),customCategory:field(' finance '),description:field('Help me plan my finances')},querySelector:s=>s==='button'?button:s==='[data-wish-count]'?count:status};
 const submit=listeners.filter(l=>l.type==='submit').at(-1).fn;
 const event={preventDefault(){},target:{closest:s=>s==='[data-wish-form]'?form:null}};
 let calls=0;ctx.fetch=async(url,options)=>{calls++;assert.equal(JSON.parse(options.body).category,'Money');return {ok:false,json:async()=>({error:'Please try again.'})};};
 await submit(event);assert.equal(calls,0);assert.match(status.textContent,/Choose a category/);
 form.elements.category.value='__other__';await submit(event);assert.equal(calls,1);assert.equal(button.disabled,false);assert.equal(status.textContent,'Please try again.');
 assert.equal(form.elements.description.value,'Help me plan my finances');assert.equal(JSON.parse(storage.get('trymybuild-wish-draft')).customCategory,' finance ');
});
function api(tables={},rpcs={},overrides={}){
 const db=mockDatabase(tables,rpcs),scope={Response,Set,JSON,normalizeWishCategory,validWish,wishCategories,json:(body,status=200)=>Response.json(body,{status}),database:()=>db,databaseReady:()=>true,origin:()=> 'https://trymybuild.test',sameOrigin:()=>true,allowRequest:async()=>true,memberContext:async()=>({user:{id:'auth-id',emailVerified:true},member:{id:'member-id'},db}),...overrides};
 return {...moduleFixture('src/pages/api/wishes.ts',['GET','POST'],scope),db};
}
test('wish API accepts custom categories, canonicalizes before storage, and retains auth/rate protections',async()=>{
 let saved;
 const request=body=>({request:new Request('https://trymybuild.test/api/wishes',{method:'POST',body:JSON.stringify(body)})});
 const body={category:' PET care ',description:'Help me care for pets'};
 const routes=api({}, {cw_submit_wish:args=>{saved=args;return {outcome:'submitted',status:'pending'};}});
 assert.equal((await routes.POST(request(body))).status,200);assert.equal(saved.p_category,'Pet Care');assert.equal(saved.p_user,'member-id');
 for(const category of ['All','Other','<script>','a'.repeat(49)])assert.equal((await routes.POST(request({...body,category}))).status,400);
 for(const [override,status] of [[{sameOrigin:()=>false},403],[{memberContext:async()=>null},401],[{memberContext:async()=>({user:{emailVerified:false}})},403],[{allowRequest:async()=>false},429]])assert.equal((await api({}, {},override).POST(request(body))).status,status);
});
test('public wish API returns approved categories independently of result pagination and filters legacy spellings',async()=>{
 const tables={community_wishes:[{id:'pet',category:'pet care',description:'Help me care for pets',moderation_status:'published'},...Array.from({length:205},(_,i)=>({id:String(i),category:'Technology',description:'Help me sort my files',moderation_status:'published'})),{id:'private',category:'Secret Category',moderation_status:'pending'}]};
 const routes=api(tables,{cw_wish_categories:()=>['pet care','Technology']});
 const data=await (await routes.GET({url:new URL('https://trymybuild.test/api/wishes')})).json();
 assert.equal(data.wishes.length,200);assert.equal(data.hasMore,true);assert.ok(data.categories.includes('Pet Care'));assert.ok(!data.categories.includes('Secret Category'));
 const filtered=await (await routes.GET({url:new URL('https://trymybuild.test/api/wishes?category=Pet%20Care')})).json();assert.equal(filtered.wishes.length,1);assert.equal(filtered.wishes[0].category,'Pet Care');assert.equal(filtered.hasMore,false);
});
