// Disposable local PostgreSQL only. Never connects to the live website.
import {readFile,readdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {normalizeWishCategory} from '../src/server/wish-policy.mjs';
const {PGlite}=await import(process.argv[2]?pathToFileURL(process.argv[2]).href:'@electric-sql/pglite');
const db=new PGlite(),run=(sql,args=[])=>db.query(sql,args),value=async(sql,args=[])=>Object.values((await run(sql,args)).rows[0])[0];
try{
 await db.exec('create role anon; create role authenticated; create role service_role bypassrls; create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);');
 const founderIdentity='user_01M1Q8HVXRTVJ7ZXSC9RDZT540';
 for(const file of (await readdir(new URL('../database/',import.meta.url))).filter(x=>/^\d.*\.sql$/.test(x)).sort()){
  if(file.startsWith('004'))await run('insert into users(workos_user_id) values($1)',[founderIdentity]);
  await db.exec(await readFile(new URL('../database/'+file,import.meta.url),'utf8'));
 }
 const founder=await value('select id from users where workos_user_id=$1',[founderIdentity]);
 const user=randomUUID();await run('insert into users(id,workos_user_id) values($1,$2)',[user,'wish-fixture-'+user]);
 const submit=raw=>value('select cw_submit_wish($1,$2,$3)',[user,normalizeWishCategory(raw),'Help me care for pets']);
 const result=await submit(' PET care ');assert.equal(result.status,'pending');assert.equal(result.outcome,'submitted');
 const duplicate=await submit('pet CARE');assert.equal(duplicate.outcome,'duplicate');
 assert.deepEqual(await value('select cw_wish_categories()'),[]);
 const id=await value('select id from community_wishes where user_id=$1',[user]);
 await run('select cw_review_wish($1,$2,$3,0,$4,$5)',[founder,founderIdentity,id,'published','Approved local test wish.']);
 assert.deepEqual(await value('select cw_wish_categories()'),['Pet Care']);
 await run("insert into community_wishes(user_id,category,description,moderation_status) select $1,'Technology','Help me organize task '||n,'published' from generate_series(1,205) n",[user]);
 assert.deepEqual(await value('select cw_wish_categories()'),['Pet Care','Technology']);
 await run('select cw_review_wish($1,$2,$3,1,$4,$5)',[founder,founderIdentity,id,'hidden','Hide local test wish.']);
 assert.deepEqual(await value('select cw_wish_categories()'),['Technology']);
 for(const role of ['anon','authenticated']){await db.exec('set role '+role);await assert.rejects(run('select cw_wish_categories()'));await db.exec('reset role');}
 await db.exec('set role service_role');assert.deepEqual(await value('select cw_wish_categories()'),['Technology']);await db.exec('reset role');
 await run("update users set account_status='deleted' where id=$1",[user]);assert.deepEqual(await value('select cw_wish_categories()'),[]);
 console.log('PASS: custom category persistence, case/spacing deduplication, pending → published → hidden, 200+ wishes, service-only access, account erasure');
}catch(error){console.error('FAIL:',error.message,error.where||'');process.exitCode=1;}finally{await db.close();}
