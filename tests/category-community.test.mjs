import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {feedbackDestination} from '../src/server/feedback-policy.mjs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const app=read('app.js');
function harness(){
 const data=new Map(),state={category:'All',communityPosts:[],dailyComments:[],discussionCategory:'',session:null};
 const context=vm.createContext({state,localStorage:{getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)},projects:[],commentWordCount:s=>s.split(/\s+/).filter(Boolean).length,esc:s=>String(s).replaceAll('<','&lt;'),dailyCommentCard:p=>`<article>${p.response}</article>`,experienceCard:()=>''});
 vm.runInContext(app.slice(app.indexOf('function discussionDraftKey'),app.indexOf('function catalogRow')),context);
 return {context,state};
}
test('All tools has no community panel; one selected category reveals a matching composer without a filter',()=>{
 const {context,state}=harness();assert.equal(context.communityRail(),'');
 state.category='Family life';const html=context.communityRail();assert.match(html,/Conversations about family life/);assert.match(html,/Sign up to post/);assert.doesNotMatch(html,/data-community-filter|<select/);
 state.session={authenticated:true};assert.match(context.communityRail(),/Post comment/);
 state.category='All';assert.equal(context.communityRail(),'');
});
test('drafts stay private and separate per category and survive a new render',()=>{
 const {context,state}=harness();context.saveDiscussionDraft('Family life','My private family draft');context.saveDiscussionDraft('Technology','My technology draft');
 assert.equal(context.discussionDraft('Family life'),'My private family draft');
 state.category='Family life';assert.match(context.communityRail(),/My private family draft/);assert.doesNotMatch(context.communityRail(),/My technology draft/);
 state.dailyComments=[{response:'Wrong category response'}];state.discussionCategory='Technology';assert.doesNotMatch(context.communityRail(),/Wrong category response/);
});
test('auth returns only to a safe category URL and preserves context',()=>{
 assert.equal(feedbackDestination('/?category=Family%20life#category-community'),'/?category=Family%20life#category-community');
 assert.equal(feedbackDestination('https://evil.example/?category=Family'), '/?account=1');
 assert.equal(feedbackDestination('/?category=Family&next=https://evil.example'), '/?account=1');
});
test('server rejects anonymous/unverified posts and scopes comments by category',()=>{
 const api=read('src/pages/api/daily-comments.ts');
 assert.ok(api.indexOf('if(!user)return')<api.indexOf(".insert("));
 assert.match(api,/if\(!user.emailVerified\)/);assert.match(api,/moderation_status:'pending'/);
 assert.match(api,/eq\('category',category\)/);assert.match(api,/Choose a published category/);
 assert.match(app,/signup=1&next=/);assert.match(app,/request!==discussionRequest\|\|category!==state.category/);
});
test('category migration preserves historical comments and adds scoped uniqueness',()=>{
 const sql=read('database/013_category_discussions.sql');assert.match(sql,/category text not null default ''/);assert.match(sql,/unique\(user_id,day_key,category\)/);assert.doesNotMatch(sql,/delete from|truncate|drop table/i);
});
