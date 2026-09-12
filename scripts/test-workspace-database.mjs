// Disposable PostgreSQL tests only; no network or production connection.
import {readFile,readdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
const {PGlite}=await import(process.argv[2]?pathToFileURL(process.argv[2]).href:'@electric-sql/pglite');
const db=new PGlite(),run=(sql,args=[])=>db.query(sql,args),value=async(sql,args=[])=>Object.values((await run(sql,args)).rows[0])[0];
try{
 await db.exec('create role anon; create role authenticated; create role service_role bypassrls; create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);');
 for(const file of (await readdir(new URL('../database/',import.meta.url))).filter(x=>/^\d.*\.sql$/.test(x)).sort()){
  if(file.startsWith('004'))await run("insert into users(workos_user_id) values('user_01M1Q8HVXRTVJ7ZXSC9RDZT540')");
  await db.exec(await readFile(new URL('../database/'+file,import.meta.url),'utf8'));
 }
 const user=async()=>{const id=randomUUID();await run('insert into users(id,workos_user_id) values($1,$2)',[id,'fixture-'+id]);return id;};
 const owner=await user(),stranger=await user();
 const published=await value("insert into projects(slug,title,owner_user_id,visibility,listing_status) values('workspace-app','Workspace App',$1,'public','published') returning id",[owner]);
 const feedback=[];
 for(let i=0;i<29;i++){
  const author=await user();const id=await value("insert into creator_feedback(project_slug,author_user_id,helpful,price,visibility,message,attempt,focus,created_at) values('workspace-app',$1,'not_tried','free','private','Before trying this app I wonder whether offline mode is supported.','not_tried','ease',$2) returning id",[author,new Date(Date.UTC(2026,0,i+1)).toISOString()]);feedback.push({id,author});
 }
 const inbox=async(who,page=0,sort='newest',unread=false)=>(await run("select * from cw_workspace_inbox($1,'Workspace', $2,$3,$4)",[who,unread,page,sort])).rows;
 assert.equal((await inbox(stranger)).length,0);assert.equal((await inbox(owner)).length,25);assert.equal((await inbox(owner))[0].id,feedback[28].id);
 assert.equal((await inbox(owner,1)).length,4);assert.equal((await inbox(owner,1))[0].id,feedback[3].id);
 assert.equal((await inbox(owner,0,'oldest'))[0].id,feedback[0].id);assert.equal((await inbox(owner,1,'oldest'))[0].id,feedback[25].id);
 assert.equal((await inbox(feedback[0].author)).length,1);assert.equal(Number(await value('select unread_count from cw_project_unread($1)',[owner])),29);
 await run('select cw_mark_feedback_read($1,$2,now())',[owner,feedback[0].id]);assert.equal((await inbox(owner,1,'oldest',true)).length,3);assert.equal(Number(await value('select unread_count from cw_project_unread($1)',[owner])),28);
 await run('select cw_feedback_reply($1,$2,$3,$4)',[feedback[0].author,feedback[0].id,'I tried the calendar today and found everything clearly labeled.',randomUUID()]);assert.equal(Number(await value('select unread_count from cw_project_unread($1)',[owner])),29);
 console.log('PASS: inbox ownership, 29-thread global sort/pagination, unread counts and new replies');
 const draft=async()=>value("insert into projects(slug,title,owner_user_id,visibility,listing_status) values($1,'Private draft',$2,'draft','draft') returning id",['draft-'+randomUUID(),owner]);
 const id=await draft();await assert.rejects(run('select cw_delete_unused_draft($1,$2,0)',[stranger,id]));await assert.rejects(run('select cw_delete_unused_draft($1,$2,9)',[owner,id]));
 await run('select cw_delete_unused_draft($1,$2,0)',[owner,id]);assert.equal(Number(await value('select count(*) from projects where id=$1',[id])),0);assert.equal(Number(await value("select count(*) from operations_log where target_id=$1 and action='project.delete_unused_draft'",[id])),1);
 await assert.rejects(run("insert into site_settings(key,value) values($1,'{}')",['project-builds:'+id]));
 await assert.rejects(run('select cw_delete_unused_draft($1,$2,0)',[owner,published]));
 const built=await draft();await run("insert into site_settings(key,value) values($1,'{}')",['project-builds:'+built]);await assert.rejects(run('select cw_delete_unused_draft($1,$2,0)',[owner,built]));
 const saved=await draft();await run('insert into saved_projects(user_id,project_slug) select $1,slug from projects where id=$2',[stranger,saved]);await assert.rejects(run('select cw_delete_unused_draft($1,$2,0)',[owner,saved]));
 const reviewed=await draft();await run("insert into project_review_history(project_id,actor_user_id,action,previous_status,new_status,reason) values($1,$2,'review','in_review','draft','Retain this history')",[reviewed,owner]);await assert.rejects(run('select cw_delete_unused_draft($1,$2,0)',[owner,reviewed]));
 for(const role of ['anon','authenticated']){await db.exec('set role '+role);await assert.rejects(inbox(owner));await assert.rejects(run('select * from cw_project_unread($1)',[owner]));await assert.rejects(run('select cw_delete_unused_draft($1,$2,0)',[owner,built]));await db.exec('reset role');}
 await run("update users set account_status='suspended' where id=$1",[owner]);assert.equal((await inbox(owner)).length,0);assert.equal((await run('select * from cw_project_unread($1)',[owner])).rows.length,0);await assert.rejects(run('select cw_delete_unused_draft($1,$2,0)',[owner,built]));
 console.log('PASS: draft ownership/version/history protection, audited deletion, role permissions, inactive-account denial');
}catch(error){console.error('FAIL:',error.message,error.where||'');process.exitCode=1;}finally{await db.close();}
