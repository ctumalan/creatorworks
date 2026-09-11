// Native PostgreSQL, private Unix socket, synthetic data only. No environment credentials.
// node scripts/test-launch-concurrency.mjs /absolute/path/to/temporary-dependency-directory
import {spawn,execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp,mkdir,rm} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {testLaunchDatabase} from './test-launch-database.mjs';

const dependencies=resolve(process.argv[2]||'');
if(!dependencies.startsWith('/private/tmp/trymybuild-native-db.'))throw Error('Use a temporary test dependency directory; production connections are not supported.');
const bins=await import(pathToFileURL(join(dependencies,'node_modules/@embedded-postgres/darwin-arm64/dist/index.js')).href);
const {default:pg}=await import(pathToFileURL(join(dependencies,'node_modules/pg/lib/index.js')).href);
const exec=promisify(execFile),scratch=await mkdtemp('/private/tmp/tmb-pg-'),data=join(scratch,'data'),socket=join(scratch,'socket');
await mkdir(socket,{mode:0o700});
const clients=[];
const connection={host:socket,port:55439,database:'postgres',user:'tmb_fixture',password:'',connectionTimeoutMillis:1500,statement_timeout:10000};
let server,logs='',success=false;
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function connect(){
 const client=new pg.Client(connection);await client.connect();clients.push(client);return client;
}
try{
 await exec(bins.initdb,['-D',data,'-U','tmb_fixture','--auth-local=trust','--auth-host=reject','--encoding=UTF8','--locale=en_US.UTF-8'],{timeout:20000,maxBuffer:1024*1024});
 server=spawn(bins.postgres,['-D',data,'-k',socket,'-h','','-p','55439'],{stdio:['ignore','pipe','pipe']});
 server.on('error',error=>{logs+=error.message;});
 for(const stream of [server.stdout,server.stderr])stream.on('data',bytes=>{logs=(logs+bytes.toString()).slice(-12000);});
 let admin;
 for(let attempt=0;attempt<100;attempt++){
  try{admin=await connect();break;}catch{if(server.exitCode!==null)throw Error('Test server stopped: '+logs);await pause(50);}
 }
 if(!admin)throw Error('Test server failed to start: '+logs);
 console.log('Engine:',(await admin.query('select version()')).rows[0].version);
 console.log('Isolation: private Unix socket; TCP disabled; synthetic data only.');
 await testLaunchDatabase({query:(sql,args)=>admin.query(sql,args),exec:sql=>admin.query(sql)});
 const a=await connect(),b=await connect();
 for(const client of [a,b])await client.query('set role service_role');
 assert.notEqual(a.processID,b.processID);
 const scalar=async(client,sql,args=[])=>Object.values((await client.query(sql,args)).rows[0])[0];
 const member=async label=>scalar(admin,'insert into users(workos_user_id) values($1) returning id',['native-'+label+'-'+randomUUID()]);
 const submit=(client,id,description)=>scalar(client,"select cw_submit_wish($1,'Technology',$2)",[id,description]);
 async function blocked(client){
  for(let attempt=0;attempt<100;attempt++){
   const state=(await admin.query("select wait_event_type from pg_stat_activity where pid=$1",[client.processID])).rows[0];
   if(state?.wait_event_type==='Lock')return;
   await pause(20);
  }
  throw Error('Expected an independently connected request to wait on the row lock.');
 }
 const capped=await member('cap');
 for(let i=0;i<9;i++)await submit(admin,capped,'Organize useful local project number '+i);
 await a.query('begin');
 assert.equal((await submit(a,capped,'Help families find accessible nearby activities')).outcome,'submitted');
 const competing=submit(b,capped,'Help musicians find nearby rehearsal rooms');
 await blocked(b);
 await a.query('commit');
 assert.equal((await competing).outcome,'limit');
 assert.equal(await scalar(admin,'select count(*)::int from community_wishes where user_id=$1',[capped]),10);
 console.log('PASS: a real competing transaction waits, then rejects wish 11 after wish 10 commits.');

 const duplicateMember=await member('duplicate'),description='Find useful activities for local families';
 await a.query('begin');
 assert.equal((await submit(a,duplicateMember,description)).outcome,'submitted');
 const duplicate=submit(b,duplicateMember,description);
 await blocked(b);await a.query('commit');
 assert.equal((await duplicate).outcome,'duplicate');
 assert.equal(await scalar(admin,'select count(*)::int from community_wishes where user_id=$1',[duplicateMember]),1);
 console.log('PASS: simultaneous identical wishes produce exactly one row.');

 const founderIdentity='user_01M1Q8HVXRTVJ7ZXSC9RDZT540';
 const founder=await scalar(admin,'select id from users where workos_user_id=$1',[founderIdentity]);
 const wish=await scalar(admin,'select id from community_wishes where user_id=$1',[duplicateMember]);
 const review=(client,status)=>client.query('select cw_review_wish($1,$2,$3,0,$4,$5)',[founder,founderIdentity,wish,status,'Independent review in the disposable database.']);
 await a.query('begin');await review(a,'published');
 const stale=review(b,'hidden').then(()=>null,error=>error);
 await blocked(b);await a.query('commit');
 assert.match((await stale).message,/Reload this review/);
 assert.equal(await scalar(admin,'select revision from community_wishes where id=$1',[wish]),1);
 assert.equal(await scalar(admin,'select count(*)::int from operations_log where target_id=$1',[wish]),1);
 console.log('PASS: concurrent moderation rejects the stale decision without changing its audit history.');

 const key='native-test-limit-'+randomUUID();
 const rateResults=await Promise.all(Array.from({length:20},(_,i)=>scalar(i%2?a:b,'select cw_rate_limit($1,3,60)',[key])));
 assert.equal(rateResults.filter(Boolean).length,3);
 console.log('PASS: two real connections share the screenshot rate limit; exactly three attempts are accepted.');

 const removed=await member('erase-race');
 await a.query('begin');await submit(a,removed,'Find useful apps for local community');
 const erase=b.query('select cw_admin_erase_account($1,$2,$3,$4)',[founder,removed,founderIdentity,'Delete this synthetic account while a request completes.']);
 await blocked(b);await a.query('commit');await erase;
 assert.equal(await scalar(admin,'select count(*)::int from community_wishes where user_id=$1',[removed]),0);
 await assert.rejects(submit(a,removed,'Find another useful app for musicians'),/Active account required/);
 console.log('PASS: deletion racing a submission leaves no orphan wish, and later submissions are rejected.');
 success=true;
 console.log('SUCCESS: native migration suite and five cross-connection checks passed.');
}catch(error){console.error('FAIL:',error.message);if(logs)console.error(logs);process.exitCode=1;}
finally{
 await Promise.all(clients.map(client=>client.end().catch(()=>{})));
 if(server&&server.exitCode===null){
  try{await exec(bins.pg_ctl,['-D',data,'-m','fast','-w','stop'],{timeout:10000});}
  catch{server.kill('SIGTERM');success=false;console.error('Check stopped test server manually:',data);}
 }
 if(success){await rm(scratch,{recursive:true,force:false});console.log('Cleaned up the synthetic database; no test server remains.');}
 else console.error('Synthetic diagnostic database retained:',scratch);
}
