import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const ctx=vm.createContext({compareCatalogProjects:(a,b)=>a.name.localeCompare(b.name)});
vm.runInContext(source.slice(source.indexOf('function catalogSearchWords('),source.indexOf('function discover(')),ctx);
const catalog=[
 {name:'Grocery planner',category:'Shopping',summary:'Organizes groceries for your family'},
 {name:'AfterSchool Together',category:'Family life',summary:'Plan school pickup trips'},
 {name:'Sound studio',category:'Music & audio',summary:'Record music and mix tracks'}
];
test('natural-language searches rank meaningful words instead of requiring a phrase',()=>{
 const result=ctx.rankCatalogSearch(catalog,'I have a problem with school pickup');
 assert.equal(result.items[0].name,'AfterSchool Together');assert.equal(result.suggestions,false);
});
test('search tolerates single-character typos and transpositions',()=>{
 for(const query of ['grocrey','grocey','groceri'])assert.equal(ctx.rankCatalogSearch(catalog,query).items[0].name,'Grocery planner');
 assert.equal(ctx.catalogWordsClose('music','money'),false);
});
test('vague or unrelated queries offer bounded suggestions, preserving candidate filters',()=>{
 for(const query of ['I have a problem with','zzzzzz','   !!!']){
  const result=ctx.rankCatalogSearch([catalog[2]],query);
  assert.equal(result.suggestions,true);assert.equal(result.items.length,1);assert.equal(result.items[0].name,'Sound studio');
 }
 const many=Array.from({length:12},(_,i)=>({name:'Project '+i}));
 assert.equal(ctx.rankCatalogSearch(many,'zzzzzz').items.length,6);
 assert.equal(ctx.rankCatalogSearch([],'music').items.length,0);
});
test('blank search preserves selected sorting and does not mutate the catalog',()=>{
 const before=catalog.map(p=>p.name).join();
 const result=ctx.rankCatalogSearch(catalog,'  ');
 assert.equal(result.suggestions,false);assert.equal(result.items.length,3);
 assert.equal(result.items[0].name,'AfterSchool Together');assert.equal(catalog.map(p=>p.name).join(),before);
});
test('search interface offers closest matches and a wish instead of a dead end',()=>{
 assert.doesNotMatch(source,/Nothing matched that search/);
 assert.match(source,/Closest matches/);assert.match(source,/Here are some apps to explore within your filters/);
 assert.match(source,/data-wish-focus>Submit a wish/);
});
