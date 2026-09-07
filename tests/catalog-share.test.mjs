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
test('shared project URLs lead to a dedicated recipient page',()=>{
 const ctx=vm.createContext({URL,location:{origin:'https://creatorworks.vercel.app'}});
 vm.runInContext(source.slice(source.indexOf('function productShareUrl('),source.indexOf('function loadOwnedProjectIntoDraft(')),ctx);
 assert.equal(ctx.productShareUrl('mealmap'),'https://creatorworks.vercel.app/projects/mealmap');
});
