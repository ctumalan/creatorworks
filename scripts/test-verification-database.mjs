import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
export async function testVerification(db){
 const run=(sql,args=[])=>db.query(sql,args);
 const user=randomUUID(),request=randomUUID();
 await run('insert into users(id,workos_user_id) values($1,$2)',[user,'verification-test']);
 await run("insert into profiles(user_id,slug,display_name) values($1,'verification-test','Verification Test')",[user]);
 const progress=async()=>(await run('select * from cw_verification_progress($1)',[user])).rows[0];
 const submit=(id=randomUUID(),actor=user)=>run("select cw_request_verification($1,$2,'Creator verification review','My public site links to my creator profile.',null) as id",[actor,id]);
 assert.equal(Number((await progress()).earned),0);
 await assert.rejects(submit());
 await run("insert into credit_ledger(user_id,event_key,amount,reason) select $1,'verification-fixture:'||n,1,'Qualifying reward fixture' from generate_series(1,49) n",[user]);
 assert.equal(Number((await progress()).earned),49);
 await assert.rejects(submit());
 await run("insert into credit_ledger(user_id,event_key,amount,reason) values($1,'verification-referral-fixture',1,'Referral reward fixture')",[user]);
 assert.equal(Number((await progress()).earned),50);
 await assert.rejects(submit()); // Credits alone cannot unlock review.
 await run("insert into projects(slug,title,owner_user_id,visibility,listing_status) values('verification-project','Verification Project',$1,'public','published')",[user]);
 assert.equal((await progress()).has_published,true);
 await run("select cw_credit_request($1,$2,'verification-project','create')",[user,request]);
 assert.equal(Number((await progress()).earned),50);
 assert.equal(Number((await run('select balance from cw_credit_totals($1)',[user])).rows[0].balance),49);
 await run("select cw_credit_request($1,$2,'verification-project','cancel')",[user,request]);
 assert.equal(Number((await progress()).earned),50); // Refund is not a new reward.
 await run("insert into credit_ledger(user_id,event_key,amount,reason) values($1,'verification-reversed',-1,'Invalid reward reversed')",[user]);
 assert.equal(Number((await progress()).earned),49);
 await assert.rejects(submit());
 await run("insert into credit_ledger(user_id,event_key,amount,reason) values($1,'verification-restored',1,'Appeal accepted')",[user]);
 const id=randomUUID();
 assert.equal((await submit(id)).rows[0].id,id);
 assert.equal((await submit(id)).rows[0].id,id);
 assert.equal((await submit()).rows[0].id,id); // Different tabs reuse the pending case.
 assert.equal((await progress()).case_id,id);
 assert.equal((await progress()).verified,false); // No automatic badge.
 await run("update support_cases set status='waiting' where id=$1",[id]);
 assert.equal((await submit()).rows[0].id,id);
 await run('update profiles set verified=true where user_id=$1',[user]);
 assert.equal((await progress()).verified,true);
 assert.equal((await run("select * from notifications where user_id=$1 and kind='verification'",[user])).rows.length,1);
 await run('update profiles set verified=true where user_id=$1',[user]);
 assert.equal((await run("select * from notifications where user_id=$1 and kind='verification'",[user])).rows.length,1);
 await db.exec('set role anon');
 await assert.rejects(progress());await assert.rejects(submit());
 await db.exec('reset role');
 console.log('PASS: verification threshold, publication gate, spend/refund exclusion, reversals, request retries, manual approval and permissions');
}
