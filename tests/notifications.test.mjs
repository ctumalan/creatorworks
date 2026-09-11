import test from 'node:test';
import {recommendationInterests} from '../src/server/interest-policy.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const source=stripTypeScriptTypes(readFileSync(new URL('../src/server/notifications.ts',import.meta.url),'utf8').replace("import {createHash} from 'node:crypto';",'').replace(/^import .*;\n/gm,'').replaceAll('export ',''));
function setup(preferences={}){
 const now=new Date(),day=86400000;const tables={site_settings:[{key:'notification-preferences:A',value:preferences}],saved_projects:[{user_id:'A',project_slug:'one',created_at:new Date(+now-day*2).toISOString()},{user_id:'B',project_slug:'private',created_at:new Date(+now-day*2).toISOString()}],projects:[{id:'p',slug:'one',title:'Project One',listing_status:'published',published_at:new Date(+now-day).toISOString()},{id:'q',slug:'private',title:'Other saved project',listing_status:'published',published_at:new Date(+now-day).toISOString()}],notifications:[]};
 const db={from(table){let rows=[...(tables[table]||[])];const q={select(){return q;},eq(k,v){rows=rows.filter(r=>r[k]===v);return q;},gt(k,v){rows=rows.filter(r=>r[k]>v);return q;},in(k,v){rows=rows.filter(r=>v.includes(r[k]));return q;},order(){return q;},limit(n){rows=rows.slice(0,n);return q;},maybeSingle:async()=>({data:rows[0]||null,error:null}),then(resolve){return Promise.resolve({data:rows,error:null}).then(resolve);},upsert:async(items,options)=>{assert.equal(options.ignoreDuplicates,true);for(const row of items)if(!tables.notifications.some(r=>r.id===row.id))tables.notifications.push({...row,read_at:'preserved'});return {error:null};}};return q;}};
 const context=vm.createContext({recommendationInterests,createHash,Date});vm.runInContext(source,context);return {db,tables,prepare:context.prepareNotifications};
}
test('personal updates only include the authenticated member’s saved projects',async()=>{const s=setup();await s.prepare(s.db,'A',false);assert.equal(s.tables.notifications.length,1);assert.equal(s.tables.notifications[0].href,'/projects/one');assert.equal(s.tables.notifications[0].user_id,'A');});
test('refreshing notifications is idempotent and preserves read state',async()=>{const s=setup();await s.prepare(s.db,'A',false);const id=s.tables.notifications[0].id;await s.prepare(s.db,'A',false);assert.equal(s.tables.notifications.length,1);assert.equal(s.tables.notifications[0].id,id);assert.equal(s.tables.notifications[0].read_at,'preserved');});
test('turning off optional saved updates suppresses generation',async()=>{const s=setup({saved_updates:false});await s.prepare(s.db,'A',false);assert.equal(s.tables.notifications.length,0);});
test('build releases notify savers once, include notes, and retain event time',async()=>{
 const s=setup(),time=new Date().toISOString();s.tables.site_settings.push({key:'project-builds:p',value:{builds:[{id:'v1',version:'1.1',notes:'Search now supports keyboard navigation.'}],events:[{id:'release',buildId:'v1',createdAt:time}]}});
 await s.prepare(s.db,'A',false);await s.prepare(s.db,'A',false);
 const rows=s.tables.notifications.filter(n=>n.kind==='build');assert.equal(rows.length,1);assert.match(rows[0].title,/keyboard navigation/);assert.equal(rows[0].created_at,time);assert.equal(rows[0].href,'/projects/one#build-release');
});
test('old releases, unpublished projects, and opted-out savers receive no build update',async()=>{
 for(const mode of ['old','private','optout']){
  const s=setup(mode==='optout'?{saved_updates:false}:{});
  if(mode==='private')s.tables.projects[0].listing_status='draft';
  s.tables.site_settings.push({key:'project-builds:p',value:{builds:[{id:'v',version:'1',notes:'Improved search.'}],events:[{id:'e',buildId:'v',createdAt:mode==='old'?'2020-01-01T00:00:00.000Z':new Date().toISOString()}]}});
  await s.prepare(s.db,'A',false);assert.equal(s.tables.notifications.filter(n=>n.kind==='build').length,0);
 }
});
