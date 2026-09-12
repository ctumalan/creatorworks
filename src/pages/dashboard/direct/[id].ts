import type {APIRoute} from 'astro';
import {memberContext} from '../../../server/workspace';
import {validId} from '../../../server/feedback-policy.mjs';
import {directConversation} from '../../../server/direct-messages';
export const GET:APIRoute=async context=>{
 if(!validId(context.params.id))return new Response('Conversation not found',{status:404});
 if(context.url.searchParams.get('fragment')!=='1')return context.redirect('/dashboard/messages?direct='+context.params.id,302);
 try{const m=await memberContext(context);if(!m)return new Response('Sign in required',{status:401});const html=await directConversation(m.db,m.member.id,context.params.id!,context.url);return new Response(html||'Conversation not found',{status:html?200:404,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store'}});}catch{return new Response('Conversation unavailable',{status:503});}
};
