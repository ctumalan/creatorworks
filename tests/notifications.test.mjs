import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const source=stripTypeScriptTypes(readFileSync(new URL('../src/server/notifications.ts',import.meta.url),'utf8').replace("import {createHash} from 'node:crypto';",'').replaceAll('export ',''));
function setup(preferences={}){
 const now=new Date(),day=86400000;const tables={site_settings:[{key:'notification-preferences:A',value:preferences}],saved_projects:[{user_id:'A',project_slug:'one',created_at:new Date(+now-day*2).toISOString()},{user_id:'B',project_slug:'private',created_at:new Date(+now-day*2).toISOString()}],projects:[{id:'p',slug:'one',title:'Project One',listing_status:'published',published_at:new Date(+now-day).toISOString()},{id:'q',slug:'private',title:'Other saved project',listing_status:'published',published_at:new Date(+now-day).toISOString()}],notifications:[]};
 const db={from(table){let rows=[...(tables[table]||[])];const q={select(){return q;},eq(k,v){rows=rows.filter(r=>r[k]===v);return q;},gt(k,v){rows=rows.filter(r=>r[k]>v);return q;},in(k,v){rows=rows.filter(r=>v.includes(r[k]));return q;},order(){return q;},limit(n){rows=rows.slice(0,n);return q;},maybeSingle:async()=>({data:rows[0]||null,error:null}),then(resolve){return Promise.resolve({data:rows,error:null}).then(resolve);},upsert:async(items,options)=>{assert.equal(options.ignoreDuplicates,true);for(const row of items)if(!tables.notifications.some(r=>r.id===row.id))tables.notifications.push({...row,read_at:'preserved'});return {error:null};}};return q;}};
 const context=vm.createContext({createHash,Date});vm.runInContext(source,context);return {db,tables,prepare:context.prepareNotifications};
}
test('personal updates only include the authenticated member’s saved projects',async()=>{const s=setup();await s.prepare(s.db,'A',false);assert.equal(s.tables.notifications.length,1);assert.equal(s.tables.notifications[0].href,'/projects/one');assert.equal(s.tables.notifications[0].user_id,'A');});
test('refreshing notifications is idempotent and preserves read state',async()=>{const s=setup();await s.prepare(s.db,'A',false);const id=s.tables.notifications[0].id;await s.prepare(s.db,'A',false);assert.equal(s.tables.notifications.length,1);assert.equal(s.tables.notifications[0].id,id);assert.equal(s.tables.notifications[0].read_at,'preserved');});
test('turning off optional saved updates suppresses generation',async()=>{const s=setup({saved_updates:false});await s.prepare(s.db,'A',false);assert.equal(s.tables.notifications.length,0);});
