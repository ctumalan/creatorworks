import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
test('list and compact cards offer independent Share controls for every project',()=>{
 const ctx=vm.createContext({state:{saved:new Set()},experienceCount:()=>0,creatorLink:()=>'',categoryIcon:()=>'',esc:String});
 vm.runInContext(source.slice(source.indexOf('function productCard('),source.indexOf('function discover('))+source.slice(source.indexOf('function catalogRow('),source.indexOf('const projectPresentation =')),ctx);
 const products=vm.runInNewContext(source.match(/^const projects = (\[[\s\S]*?\n\]);/)[1]);
 for(const p of products)for(const html of [ctx.catalogRow(p),ctx.productCard(p,true)]){
  assert.ok(html.includes(`data-share-product="${p.slug}"`));
  assert.ok(html.includes(`aria-label="Share ${p.name}"`));
  assert.match(html,/data-share-status role="status"/);
  assert.match(html,/<button type="button" class="secondary-button" data-share-product=/);
 }
});
function shareContext(navigator){
 let handler;const status={textContent:''};let fallback;
 const parent={querySelector:selector=>selector==='[data-share-status]'?status:fallback,append:input=>fallback=input};
 const button={dataset:{shareProduct:'mealmap'},parentElement:parent};
 const ctx=vm.createContext({URL,location:{origin:'https://creatorworks.vercel.app'},projects:[{slug:'mealmap',name:'MealMap',summary:'Plan meals'}],navigator,document:{addEventListener:(_,fn)=>handler=fn,createElement:()=>({dataset:{},setAttribute(){},focus(){},select(){}})}});
 vm.runInContext(source.slice(source.indexOf('function productShareUrl('),source.indexOf('function loadOwnedProjectIntoDraft(')),ctx);
 return {run:()=>handler({target:{closest:()=>button}}),status,fallback:()=>fallback};
}
test('desktop share copies the specific CW listing, not the external website',async()=>{
 let copied;const ctx=shareContext({clipboard:{writeText:async value=>{copied=value;}}});await ctx.run();
 assert.equal(copied,'https://creatorworks.vercel.app/?project=mealmap');assert.equal(ctx.status.textContent,'Link copied');
});
test('native share and cancellation do not trigger copying',async()=>{
 let shared;const ctx=shareContext({share:async value=>{shared=value;}});await ctx.run();assert.equal(shared.url,'https://creatorworks.vercel.app/?project=mealmap');
 const cancelled=shareContext({share:async()=>{throw {name:'AbortError'};}});await cancelled.run();assert.equal(cancelled.status.textContent,'');assert.equal(cancelled.fallback(),undefined);
});
test('blocked clipboard offers a manually selectable project link',async()=>{
 const ctx=shareContext({clipboard:{writeText:async()=>{throw Error('Denied');}}});await ctx.run();assert.equal(ctx.fallback().value,'https://creatorworks.vercel.app/?project=mealmap');assert.equal(ctx.fallback().readOnly,true);
});
