// Isolated PostgreSQL-in-WASM test. No network or production credentials are used.
// node scripts/test-review-database.mjs /absolute/path/to/@electric-sql/pglite/dist/index.js
import {readFile,readdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {testVerification} from './test-verification-database.mjs';
const {PGlite}=await import(process.argv[2]?pathToFileURL(process.argv[2]).href:'@electric-sql/pglite');
const db=new PGlite();
const run=(sql,args=[])=>db.query(sql,args);
const value=async(sql,args=[])=>Object.values((await run(sql,args)).rows[0])[0];
try{
 await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
 await db.exec('create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);');
 for(const file of (await readdir(new URL('../database/',import.meta.url))).filter(x=>/^\d.*\.sql$/.test(x)).sort()){
  if(file.startsWith('004'))await run("insert into users(workos_user_id) values('user_01M1Q8HVXRTVJ7ZXSC9RDZT540')");
  try{await db.exec(await readFile(new URL('../database/'+file,import.meta.url),'utf8'));}catch(error){console.error('Migration failed:',file,error.message);throw new Error(error.message);}
 }
 console.log('PASS: all migrations apply to an isolated database');
 const ids=Array.from({length:9},()=>randomUUID());
 for(let i=0;i<ids.length;i++){
  await run('insert into users(id,workos_user_id) values($1,$2)',[ids[i],'test-user-'+i]);
  await run('insert into profiles(user_id,slug,display_name) values($1,$2,$3)',[ids[i],'test-member-'+i,'Test Creator '+i]);
 }
 for(let i=1;i<=6;i++)await run("insert into projects(slug,title,owner_user_id,visibility,listing_status) values($1,$2,$3,'public','published')",['test-app-'+i,'Test App '+i,ids[i]]);
 await run("insert into project_slot_grants(user_id,milestone,reason) values($1,-1,'Test fixture')",[ids[1]]);
 await run("insert into projects(slug,title,owner_user_id,visibility,listing_status) values('test-repeat','Second app',$1,'public','published')",[ids[1]]);
 const feedback=async(slug,message,attempt='completed',user=ids[0])=>value("insert into creator_feedback(project_slug,author_user_id,helpful,price,visibility,message,attempt,focus) values($1,$2,'not_yet','free','private',$3,$4,'ease') returning id",[slug,user,message,attempt]);
 const balance=()=>value('select coalesce(sum(amount),0)::integer from credit_ledger where user_id=$1',[ids[0]]);
 const f=await feedback('test-app-1','I tested the search filters but could not locate saved recipes.');
 assert.equal(await balance(),1);
 await run('select cw_rate_feedback($1,$2,5,$3,0)',[ids[1],f,'This clarified how our search should handle saved recipes.']);
 assert.equal(await balance(),5);
 await run('select cw_rate_feedback($1,$2,5,$3,1)',[ids[1],f,'This clarified how our search should handle saved recipes.']);
 assert.equal(await balance(),5);
 await assert.rejects(run('select cw_rate_feedback($1,$2,10,$3,0)',[ids[1],f,'We completely redesigned search based on this review.']));
 await assert.rejects(run('select cw_rate_feedback($1,$2,10,$3,1)',[ids[2],f,'A different creator cannot award this recognition.']));
 await run('select cw_rate_feedback($1,$2,10,$3,1)',[ids[1],f,'We completely redesigned search based on this review.']);
 assert.equal(await balance(),10);
 await assert.rejects(feedback('test-app-1','Another response must not produce a duplicate reward.'));
 const repeated=await feedback('test-repeat','The calendar exported every appointment correctly including the appointment location.');
 await assert.rejects(run('select cw_rate_feedback($1,$2,5,$3,0)',[ids[1],repeated,'The second project must not bypass the pair limit.']));
 assert.equal(await balance(),11);
 assert.equal(await value('select count(*)::integer from project_slot_grants where user_id=$1',[ids[0]]),0);
 console.log('PASS: 1 → 5 → 10 totals, duplicate retries, stale decisions, owner checks, pair cap');
 const messages=['Exporting the grocery list preserved quantities but lost aisle grouping.', 'Uploading a landscape photograph failed with an unexplained timeout message.', 'The onboarding instructions never explained which invitation link to send.', 'Comparing delivery prices worked although taxes appeared only during checkout.'];
 for(let i=2;i<=5;i++)await feedback('test-app-'+i,messages[i-2],i===3?'blocked':'completed');
 assert.equal(await value('select count(*)::integer from project_slot_grants where user_id=$1',[ids[0]]),1);
 const pending=await feedback('test-app-6','Before trying this tool I wonder whether group calendars are supported.','not_tried',ids[7]);
 assert.equal(await value('select status from feedback_qualifications where feedback_id=$1',[pending]),'pending');
 assert.equal(await value('select count(*)::integer from credit_ledger where user_id=$1',[ids[7]]),0);
 await assert.rejects(feedback('test-app-2','Reviewing my own work should never earn community rewards.','completed',ids[2]));
 console.log('PASS: distinct-creator milestones, attempted-use eligibility, self-review rejection');
 assert.equal((await run('select * from cw_message_inbox($1)',[ids[8]])).rows.length,0);
 assert.equal((await run('select * from cw_message_inbox($1)',[ids[1]])).rows.length,2);
 assert.equal((await run("select * from cw_message_inbox($1,'Test App 1',true,0)",[ids[1]])).rows.length,1);
 await run('select cw_mark_feedback_read($1,$2,now())',[ids[1],f]);
 await run("select cw_mark_feedback_read($1,$2,'2000-01-01')",[ids[1],f]);
 assert.equal((await run("select * from cw_message_inbox($1,'Test App 1',true,0)",[ids[1]])).rows.length,0);
 await assert.rejects(run('select cw_mark_feedback_read($1,$2,now())',[ids[8],f]));
 await assert.rejects(run('select cw_feedback_reply($1,$2,$3,$4)',[ids[8],f,'A stranger must not be able to answer here.',randomUUID()]));
 await run('select cw_feedback_reply($1,$2,$3,$4)',[ids[1],f,'Thank you for explaining exactly where the search failed.',randomUUID()]);
 assert.equal((await run("select * from cw_message_inbox($1,'Test App 1',true,0)",[ids[0]])).rows.length,1);
 console.log('PASS: inbox ownership, project/unread filters, monotonic reads, reply isolation');
 const request=randomUUID();
 await run("insert into credit_ledger(user_id,event_key,amount,reason) values($1,'fixture',1,'Test setup')",[ids[6]]);
 await run("select cw_credit_request($1,$2,'test-app-6','create')",[ids[6],request]);
 const requested=await feedback('test-app-6','Keyboard navigation reached every button but skipped the submit action.');
 assert.equal(await value('select status from feedback_requests where id=$1',[request]),'fulfilled');
 await run('select cw_rate_feedback($1,$2,10,$3,0)',[ids[6],requested,'This helped us fix a major accessibility issue.']);
 const before=await balance();
 await run("select cw_credit_review($1,$2,'revoked','Test moderation reversal',0)",[ids[8],requested]);
 assert.equal(await balance(),before-10);
 assert.equal(await value('select status from feedback_requests where id=$1',[request]),'invalidated');
 assert.equal(await value('select sum(amount)::integer from credit_ledger where user_id=$1',[ids[6]]),1);
 await run("select cw_credit_review($1,$2,'qualified','Test appeal accepted',1)",[ids[8],requested]);
 assert.equal(await balance(),before-9);
 console.log('PASS: request reservation/fulfillment, full bonus reversal, refund, appeal requalification');
 for(let i=2;i<=5;i++){
  const fid=await value('select id from creator_feedback where project_slug=$1 and author_user_id=$2',['test-app-'+i,ids[0]]);
  await run('select cw_rate_feedback($1,$2,5,$3,0)',[ids[i],fid,'A specific useful improvement came from this feedback.']);
 }
 await run("insert into projects(slug,title,owner_user_id,visibility,listing_status) values('test-cap','Cap test',$1,'public','published')",[ids[8]]);
 const capped=await feedback('test-cap','Audio playback stopped abruptly whenever the phone entered sleep mode.');
 await assert.rejects(run('select cw_rate_feedback($1,$2,5,$3,0)',[ids[8],capped,'This sixth monthly bonus should be rejected.']));
 console.log('PASS: rolling five-bonus limit');
 await run("insert into credit_ledger(user_id,event_key,amount,reason) select $1,'large-fixture:'||n,1,'Test large ledger' from generate_series(1,1010) n",[ids[8]]);
 assert.equal(await value('select balance from cw_credit_totals($1)',[ids[8]]),1010);
 console.log('PASS: credit totals are not truncated by API row limits');
 await db.exec('set role anon');
 await assert.rejects(run('select * from feedback_reads'));
 await assert.rejects(run('select * from cw_message_inbox($1)',[ids[0]]));
 await db.exec('reset role');
 const founder=await value("select id from users where workos_user_id='user_01M1Q8HVXRTVJ7ZXSC9RDZT540'");
 await run('select cw_admin_erase_account($1,$2,$3,$4)',[founder,ids[7],'user_01M1Q8HVXRTVJ7ZXSC9RDZT540','Testing erasure using a disposable isolated account.']);
 assert.equal(await value('select account_status from users where id=$1',[ids[7]]),'deleted');
 console.log('PASS: database permissions and disposable-account erasure');
 await testVerification(db);
}catch(error){console.error('FAIL:',error.message,error.where||'');process.exitCode=1;}finally{await db.close();}
