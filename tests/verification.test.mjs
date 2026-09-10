import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
const source=await readFile(new URL('../src/server/verification.ts',import.meta.url),'utf8');
const {verificationProgress,verificationCard}=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64'));
const db=(data,error=null)=>({rpc:async(name,args)=>{assert.equal(name,'cw_verification_progress');assert.equal(args.p_user,'member');return {data,error};}});
test('verification requires the credit threshold and a published project',async()=>{
 for(const [earned,published,eligible] of [[49,true,false],[50,false,false],[50,true,true],[75,true,true]]){
  const s=await verificationProgress(db([{earned:String(earned),has_published:published,verified:false,case_id:null}]),'member');
  assert.equal(s.eligible,eligible);assert.equal(s.earned,earned);
 }
 await assert.rejects(verificationProgress(db(null,new Error('unavailable')),'member'));
});
test('verification card offers the appropriate next action and clamps the meter',()=>{
 const base={earned:30,hasPublished:true,verified:false,caseId:null,eligible:false};
 assert.match(verificationCard(base),/20 more to unlock/);
 assert.match(verificationCard(base),/Earn credits by reviewing/);
 assert.match(verificationCard({...base,earned:50,hasPublished:false}),/Publish a project/);
 const ready=verificationCard({...base,earned:75,eligible:true});
 assert.match(ready,/max="50" value="50"/);assert.match(ready,/Request verification review/);
 assert.match(verificationCard({...base,caseId:'case-id'}),/View your review request/);
 const approved=verificationCard({...base,verified:true});
 assert.match(approved,/You’re a Verified Creator/);assert.doesNotMatch(approved,/Request verification review/);
});
