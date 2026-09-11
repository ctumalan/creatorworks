import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
test('menu refresh anchors the replacement control and restores focus without smooth scrolling',()=>{
 let rendered=false,focused=false,scroll;
 const ctx=vm.createContext({
  window:{scrollY:1800,scrollX:0,scrollTo:value=>{scroll=value;}},
  document:{querySelector:()=>({getBoundingClientRect:()=>({top:rendered?-300:200}),focus:options=>{focused=options.preventScroll;}})},
  render:preserve=>{assert.equal(preserve,true);rendered=true;}
 });
 vm.runInContext(source.slice(source.indexOf('function renderMenuChange('),source.indexOf('function render(preserveScroll')),ctx);
 ctx.renderMenuChange('[data-wish-category-filter]');
 assert.equal(focused,true);assert.equal(scroll.top,1300);assert.equal(scroll.behavior,'instant');
});
test('wish and catalog dropdowns use anchored refreshes',()=>{
 const entry=readFileSync(new URL('../community-entry.js',import.meta.url),'utf8');
 assert.match(entry,/renderMenuChange\('\[data-wish-category-filter\]'\)/);
 for(const name of ['sort-select','creator-type-select','verified-select','price-select','listing-category-choice'])
  assert.ok(source.includes(`renderMenuChange('[data-${name}]')`));
});
