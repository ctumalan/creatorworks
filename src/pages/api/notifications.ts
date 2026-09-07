import {prepareNotifications} from '../../server/notifications';
import type { APIRoute } from 'astro';
import { memberContext } from '../../server/workspace';
import { json,origin } from '../../server/auth';
import { sameOrigin } from '../../server/security.mjs';
import { allowRequest } from '../../server/abuse';
export const GET:APIRoute=async context=>{
 try{const m=await memberContext(context);if(!m)return json({error:'Sign in required'},401);
 if(!await allowRequest(m.user.id,'notification-read',30))return json({error:'Please wait'},429);
 await prepareNotifications(m.db,m.member.id,m.admin);
 const [count,rows]=await Promise.all([m.db.from('notifications').select('id',{head:true,count:'exact'}).eq('user_id',m.member.id).is('read_at',null),m.db.from('notifications').select('id,title,href,read_at,created_at').eq('user_id',m.member.id).order('created_at',{ascending:false}).limit(8)]);if(count.error||rows.error)throw Error();return json({unread:count.count,items:rows.data});
 }catch{return json({error:'Notifications unavailable'},503);}
};
export const POST:APIRoute=async context=>{
 if(!sameOrigin(context.request,origin(context)))return json({error:'Forbidden'},403);
 try{const m=await memberContext(context);if(!m)return json({error:'Sign in required'},401);const body=await context.request.text();if(body.length>200)return json({error:'Too large'},413);const {id}=JSON.parse(body);if(!/^[0-9a-f-]{36}$/.test(id))return json({error:'Invalid notification'},400);
 const r=await m.db.from('notifications').update({read_at:new Date().toISOString()}).eq('id',id).eq('user_id',m.member.id);return json({saved:!r.error},r.error?503:200);
 }catch{return json({error:'Unable to save'},503);}
};
