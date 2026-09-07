import {test} from 'node:test';
import assert from 'node:assert/strict';
import {caseInput,publicWebsite,preferences,canManageTarget} from '../src/server/dashboard-policy.mjs';
test('support input accepts defined case types and bounds user content',()=>{
 const valid={kind:'copyright',subject:'My original work',message:'Please review this project.',project:'mealmap'};
 assert.equal(caseInput(valid).project_slug,'mealmap');
 for(const bad of [{kind:'admin'},{subject:'x'},{message:'short'},{message:'x'.repeat(4001)},{project:'x?access=secret'}])assert.equal(caseInput({...valid,...bad}),null);
});
test('profile website rejects executable links and embedded credentials',()=>{
 assert.equal(publicWebsite('https://example.com/me'),'https://example.com/me');
 for(const v of ['javascript:alert(1)','data:text/html,x','https://name:password@example.com','//example.com'])assert.equal(publicWebsite(v),null);
});
test('preferences deduplicate topics and use explicit boolean choices',()=>{
 assert.deepEqual(preferences({interests:'Music, Family life, Music',tips:'on'}),{feedback_alerts:false,publication_alerts:false,tips:true,interests:['Music','Family life']});
 assert.equal(preferences({interests:Array(11).fill('a').join(',')}),null);
});
test('member administration protects founder and rejects non-admin or inactive actors',()=>{
 const a={workos_user_id:'founder',account_status:'active'},t={workos_user_id:'member',account_status:'active',system_role:'member'};
 assert.equal(canManageTarget(a,t,'founder'),true);
 for(const actor of [null,{...a,workos_user_id:'other'},{...a,account_status:'suspended'}])assert.equal(canManageTarget(actor,t,'founder'),false);
 for(const target of [{...t,workos_user_id:'founder'},{...t,system_role:'admin'},{...t,account_status:'deleted'}])assert.equal(canManageTarget(a,target,'founder'),false);
});
