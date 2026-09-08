import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {randomUUID} from 'node:crypto';
import vm from 'node:vm';
const source=stripTypeScriptTypes(readFileSync(new URL('../src/server/builds.ts',import.meta.url),'utf8').replace("import {randomUUID} from 'node:crypto';",'').replaceAll('export ',''));
const ctx=vm.createContext({randomUUID,structuredClone,Date});vm.runInContext(source+'\nglobalThis.emptyBuilds = emptyBuilds;',ctx);
const create=(state,version='1.0')=>ctx.changeBuild(state,{action:'create',revision:state.revision,version,notes:'Improved search and fixed the preview.'},true);
const activate=(state,id=state.builds[0].id)=>ctx.changeBuild(state,{action:'activate',revision:state.revision,build:id},true);
test('saving a build is private until activation; reselecting is idempotent',()=>{
 const draft=create(ctx.emptyBuilds());assert.equal(draft.events.length,0);assert.equal(draft.active,'');
 const live=activate(draft);assert.equal(live.events.length,1);assert.equal(live.active,draft.builds[0].id);assert.equal(activate(live),live);
});
test('switching to another build and back preserves each release and notes',()=>{
 let s=activate(create(ctx.emptyBuilds()));const first=s.active;s=create(s,'2.0');s=activate(s,s.builds[1].id);s=activate(s,first);
 assert.equal(s.events.length,3);assert.equal(new Set(s.events.map(e=>e.id)).size,3);assert.equal(s.active,first);assert.equal(s.builds.length,2);
});
test('invalid, stale, unpublished and foreign-build changes are rejected',()=>{
 const s=create(ctx.emptyBuilds());assert.throws(()=>create(s,'1.0'),/already exists/);
 assert.throws(()=>ctx.changeBuild(s,{action:'activate',revision:0,build:s.builds[0].id},true),/another window/);
 assert.throws(()=>ctx.changeBuild(s,{action:'activate',revision:1,build:s.builds[0].id},false),/Publish/);
 assert.throws(()=>activate(s,'foreign-id'),/Choose/);
 assert.throws(()=>ctx.changeBuild(s,{action:'create',revision:1,version:'2',notes:'short'},true),/10–300/);
});
test('concurrent update conflict fails instead of overwriting release history',async()=>{
 const before=create(ctx.emptyBuilds()),next=activate(before);let guarded=false;
 const q={update(){return q;},eq(k,v){if(k==='value->>revision'){guarded=true;assert.equal(v,'1');}return q;},select:async()=>({data:[],error:null})};
 await assert.rejects(ctx.saveBuilds({from:()=>q},'project',before,next),/Reload/);assert.equal(guarded,true);
});
