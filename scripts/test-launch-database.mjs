// Disposable, in-memory PostgreSQL tests. Never reads environment/database credentials.
// node scripts/test-launch-database.mjs /absolute/path/to/@electric-sql/pglite/dist/index.js
import {readFile,readdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {validWish,wishCategories} from '../src/server/wish-policy.mjs';
import {recommendationInterests} from '../src/server/interest-policy.mjs';

export async function testLaunchDatabase(db){
const run=(sql,args=[])=>db.query(sql,args);
const scalar=async(sql,args=[])=>Object.values((await run(sql,args)).rows[0])[0];
const one=async(sql,args=[])=> (await run(sql,args)).rows[0];
let groups=0;
const pass=message=>{groups++;console.log('PASS:',message);};
const founderIdentity='user_01M1Q8HVXRTVJ7ZXSC9RDZT540';
const migration=await readFile(new URL('../database/019_launch_safety.sql',import.meta.url),'utf8');
const member=async(label)=>{
 const id=randomUUID();
 await run('insert into users(id,workos_user_id) values($1,$2)',[id,'launch-fixture-'+label]);
 await run('insert into profiles(user_id,slug,display_name) values($1,$2,$3)',[id,'launch-fixture-'+label,'Launch fixture '+label]);
 return id;
};
const submit=(user,description,category='Technology')=>scalar('select cw_submit_wish($1,$2,$3)',[user,category,description]);
const review=(actor,id,revision,status,reason='Reviewed this disposable test wish.',founder=founderIdentity)=>run('select cw_review_wish($1,$2,$3,$4,$5,$6)',[actor,founder,id,revision,status,reason]);
try{
 await db.exec('create role anon; create role authenticated; create role service_role bypassrls; create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);');
 for(const file of (await readdir(new URL('../database/',import.meta.url))).filter(file=>/^\d.*\.sql$/.test(file)&&file<'019').sort()){
  if(file.startsWith('004'))await run('insert into users(workos_user_id) values($1)',[founderIdentity]);
  await db.exec(await readFile(new URL('../database/'+file,import.meta.url),'utf8'));
 }
 const founder=await scalar('select id from users where workos_user_id=$1',[founderIdentity]);
 const a=await member('a'),b=await member('b'),suspended=await member('suspended'),deleted=await member('deleted');
 await run("update users set account_status='suspended' where id=$1",[suspended]);
 await run("update users set account_status='deleted' where id=$1",[deleted]);
 await run('insert into account_preferences(user_id,interests,personalization) values($1,$2,false)',[a,['Travel','Music & audio']]);
 await run('insert into account_preferences(user_id,interests) values($1,$2)',[b,['Technology']]);
 const legacy=await scalar('insert into community_wishes(user_id,category,description) values($1,$2,$3) returning id',[a,'Travel','Find accessible activities near my hotel']);
 const legacyRow=await one('select * from community_wishes where id=$1',[legacy]);
 // A failed migration must roll back both schema and copied values.
 await assert.rejects(db.exec(migration.replace(/commit;\s*$/,'select 1/0; commit;')));
 await db.exec('rollback');
 assert.equal(await scalar("select count(*)::int from information_schema.columns where table_name='community_wishes' and column_name='moderation_status'"),0);
 assert.deepEqual(await one('select * from community_wishes where id=$1',[legacy]),legacyRow);
 await db.exec(migration);
 const after=await one('select * from community_wishes where id=$1',[legacy]);
 for(const key of Object.keys(legacyRow))assert.deepEqual(after[key],legacyRow[key],key);
 assert.equal(after.moderation_status,'pending');assert.equal(after.revision,0);
 assert.equal(await scalar("select count(*)::int from community_wishes where moderation_status='published'"),0);
 assert.deepEqual(await scalar('select selected_interests from account_preferences where user_id=$1',[a]),['Travel','Music & audio']);
 pass('018 → 019 upgrade preserves existing data; existing wishes await review; failed migration rolls back');

 // Use the same token rules as the browser, including punctuation and Unicode examples.
 const phrases=[
  '', 'one two three', 'one two three four', 'one two three four five six seven eight nine ten eleven',
  'one two three four five six seven eight nine ten eleven twelve',
  "Find kid-friendly cafés near grandma’s home",
  "Help me/you plan trips", 'Plan meals—track costs/save time',
  'Organiza cafés útiles cerca de mí', 'Trouver des cafés où travailler ensemble',
  'Help parents organize 3D-printing projects', 'one...two...three...four',
  '你好 世界 我的 项目', '😊 one two three four 😊',
  'Build tools for café\u0301 owners', 'Find 🏡 homes near local cafés'
 ];
 for(const text of phrases){
  const jsCount=(text.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu)||[]).length;
  assert.equal(await scalar('select cw_wish_words($1)',[text]),jsCount,'word count: '+text);
  assert.equal(validWish('Technology',text),jsCount>=4&&jsCount<=11&&text.length<=180);
 }
 pass('database word counts match client punctuation, apostrophes, hyphens, numbers, accents and Unicode');

 await db.exec('set role service_role');
 assert.equal((await submit(a,legacyRow.description,'Travel')).outcome,'duplicate');
 assert.equal((await submit(a,'Help me organize useful bookmarks')).outcome,'submitted');
 const wish=await one("select * from community_wishes where user_id=$1 and category='Technology'",[a]);
 assert.equal(wish.moderation_status,'pending');
 for(const user of [suspended,deleted,randomUUID(),null])await assert.rejects(submit(user,'Find useful apps for busy people'));
 for(const description of ['only three words','one two three four five six seven eight nine ten eleven twelve','x'.repeat(181),'',null])await assert.rejects(submit(a,description));
 await assert.rejects(submit(a,'Find useful apps for busy people',''));
 const beforeAudit=await scalar("select count(*)::int from operations_log where action like 'wish.%'");
 await assert.rejects(review(b,wish.id,0,'published'));
 await assert.rejects(review(founder,wish.id,0,'published','Too short reason','wrong-identity'));
 await assert.rejects(review(founder,wish.id,0,'unexpected'));
 await assert.rejects(review(founder,wish.id,0,'published','  '));
 await review(founder,wish.id,0,'published');
 assert.equal(await scalar("select count(*)::int from community_wishes where moderation_status='published' and id=$1",[wish.id]),1);
 await assert.rejects(review(founder,wish.id,0,'hidden')); // stale editor
 await review(founder,wish.id,1,'hidden');
 assert.equal(await scalar("select count(*)::int from community_wishes where moderation_status='published' and id=$1",[wish.id]),0);
 assert.equal((await submit(a,'Help me organize useful bookmarks')).status,'hidden');
 assert.equal(await scalar("select count(*)::int from operations_log where action like 'wish.%'"),beforeAudit+2);
 const reviewed=await one('select * from community_wishes where id=$1',[wish.id]);
 assert.equal(reviewed.revision,2);assert.equal(reviewed.reviewed_by,founder);assert.ok(reviewed.reviewed_at);
 pass('service role submits; only active founder reviews; hiding, duplicates, stale revisions and audit history work');
 await db.exec('reset role');

 for(const role of ['anon','authenticated']){
  await db.exec('set role '+role);
  for(const operation of [
   ()=>run('select * from community_wishes'),
   ()=>run("insert into community_wishes(user_id,category,description) values($1,'Technology','Find useful apps for busy people')",[a]),
   ()=>run("update community_wishes set moderation_status='published' where id=$1",[legacy]),
   ()=>run('delete from community_wishes where id=$1',[legacy]),
   ()=>submit(a,'Find useful apps for busy people'),
   ()=>review(founder,legacy,0,'published'),
   ()=>run('select selected_interests from account_preferences where user_id=$1',[a]),
  ])await assert.rejects(operation());
  await db.exec('reset role');
 }
 pass('anonymous and authenticated browser roles cannot read/write wishes, preferences, or moderation functions');

 const capped=await member('cap');
 for(let i=0;i<9;i++)assert.equal((await submit(capped,'Help me organize useful project '+i)).outcome,'submitted');
 // PGlite queues these on one backend; real multi-session lock tests are a separate check.
 const attempts=await Promise.all([submit(capped,'Find better tools for busy families'),submit(capped,'Find better apps for local musicians')]);
 assert.deepEqual(attempts.map(x=>x.outcome).sort(),['limit','submitted']);
 assert.equal(await scalar("select count(*)::int from community_wishes where user_id=$1 and moderation_status in ('pending','published')",[capped]),10);
 assert.equal((await submit(capped,'Help me organize useful project 0')).outcome,'duplicate');
 const oldest=await scalar('select id from community_wishes where user_id=$1 order by created_at,id limit 1',[capped]);
 await review(founder,oldest,0,'hidden');
 assert.equal((await submit(capped,'Discover useful local apps for musicians')).outcome,'submitted');
 assert.equal(await scalar('select count(*)::int from community_wishes where user_id=$1',[capped]),11);
 pass('10-wish boundary, queued competing submissions, duplicate retry at capacity, and hidden-wish replacement');

 const pager=await member('pages');
 // Existing users can have more than 10 historical rows; every moderation page must remain reachable.
 for(let i=0;i<61;i++)await run("insert into community_wishes(user_id,category,description) values($1,'Technology',$2)",[pager,'Find useful tools for project '+i]);
 const seen=[];
 for(let page=0;page<3;page++){
  const rows=(await run('select id from community_wishes where user_id=$1 order by created_at,id limit 25 offset $2',[pager,page*25])).rows;
  assert.equal(rows.length,[25,25,11][page]);seen.push(...rows.map(x=>x.id));
 }
 assert.equal(new Set(seen).size,61);
 pass('moderation pagination reaches all historical rows without duplication');

 await run('update account_preferences set selected_interests=$2,personalization=true where user_id=$1',[a,['Travel','Design']]);
 const publishedCategory=await scalar("select category from projects where listing_status='published' and category<>'' limit 1");
 await run('select cw_record_category_interest($1,$2)',[a,publishedCategory]);
 let pref=await one('select * from account_preferences where user_id=$1',[a]);
 assert.deepEqual(pref.selected_interests,['Travel','Design']);
 assert.ok(pref.interests.includes(publishedCategory));
 // Same upsert shape as /api/dashboard: do not overwrite the separate column.
 await run('delete from category_engagement where user_id=$1',[a]);
 await run("insert into account_preferences(user_id,interests) values($1,'{}') on conflict(user_id) do update set interests=excluded.interests",[a]);
 pref=await one('select * from account_preferences where user_id=$1',[a]);
 assert.deepEqual(pref.interests,[]);assert.deepEqual(pref.selected_interests,['Travel','Design']);
 await run('update account_preferences set personalization=false where user_id=$1',[a]);
 await run('select cw_record_category_interest($1,$2)',[a,publishedCategory]);
 pref=await one('select * from account_preferences where user_id=$1',[a]);
 assert.deepEqual(pref.interests,[]);
 assert.deepEqual(recommendationInterests(pref),['Travel','Design']);
 assert.deepEqual(await scalar('select selected_interests from account_preferences where user_id=$1',[b]),['Technology']);
 await run("update account_preferences set selected_interests='{}' where user_id=$1",[a]);
 assert.deepEqual(await scalar('select selected_interests from account_preferences where user_id=$1',[a]),[]);
 pass('interest edit, clear, learned activity, history reset, personalization opt-out and member isolation');

 // Account export reads only this member's rows, including wishes and selected interests.
 const exported=JSON.parse(JSON.stringify({
  wishes:(await run('select * from community_wishes where user_id=$1',[a])).rows,
  preferences:(await run('select * from account_preferences where user_id=$1',[a])).rows
 }));
 assert.ok(exported.wishes.length);assert.ok(exported.wishes.every(x=>x.user_id===a));
 assert.equal(exported.preferences.length,1);assert.deepEqual(exported.preferences[0].selected_interests,[]);
 const otherCount=await scalar('select count(*)::int from community_wishes where user_id=$1',[capped]);
 await run('select cw_admin_erase_account($1,$2,$3,$4)',[founder,a,founderIdentity,'Delete this isolated test account after checking export.']);
 assert.equal(await scalar('select count(*)::int from community_wishes where user_id=$1',[a]),0);
 assert.equal(await scalar('select count(*)::int from account_preferences where user_id=$1',[a]),0);
 assert.equal(await scalar('select count(*)::int from community_wishes where user_id=$1',[capped]),otherCount);
 pass('export-shaped reads remain member-scoped; account erasure removes wishes/interests and preserves other members');
 console.log('SUCCESS:',groups,'isolated database test groups. No production connection used.');
 console.log('NOTE: parallel Promise calls on this connection are queued, not cross-session lock tests.');
 }catch(error){console.error('FAIL:',error.message,error.where||'');throw error;}
}

if(process.argv[1] && pathToFileURL(process.argv[1]).href===import.meta.url){
 const {PGlite}=await import(process.argv[2]?pathToFileURL(process.argv[2]).href:'@electric-sql/pglite');
 const db=new PGlite();
 try{await testLaunchDatabase(db);}catch{process.exitCode=1;}finally{await db.close();}
}
