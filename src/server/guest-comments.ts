import {createHmac,randomBytes,timingSafeEqual,createHash} from 'node:crypto';
import type {APIContext} from 'astro';
import {env,cookieOptions} from './auth';
export const guestCookie='cw_guest_comments';
const mac=(body:string)=>createHmac('sha256',env('WORKOS_COOKIE_PASSWORD')).update('guest-comment:'+body).digest('hex');
export function guestToken(context:APIContext,create=false){
 const token=context.cookies.get(guestCookie)?.value||'',parts=token.split('.');
 if(parts.length===3&&/^[a-f0-9]{64}$/.test(parts[0])&&/^\d{10,13}$/.test(parts[1])&&/^[a-f0-9]{64}$/.test(parts[2])){
  const age=Date.now()-Number(parts[1]),expected=mac(parts[0]+'.'+parts[1]);
  if(age>=0&&age<7*86400000&&timingSafeEqual(Buffer.from(expected),Buffer.from(parts[2])))return createHash('sha256').update(parts[0]).digest('hex');
 }
 if(!create)return null;if(env('WORKOS_COOKIE_PASSWORD').length<32)throw Error('Guest protection unavailable');
 const secret=randomBytes(32).toString('hex'),body=secret+'.'+Date.now();context.cookies.set(guestCookie,body+'.'+mac(body),{...cookieOptions(context),maxAge:7*86400});
 return createHash('sha256').update(secret).digest('hex');
}
export async function claimGuestComments(context:APIContext,db:any,user:string){
 if(context.cookies.get('cw_guest_updates')?.value!=='yes')return;
 const hash=guestToken(context);if(!hash){context.cookies.delete('cw_guest_updates',{path:'/'});return;}
 const r=await db.rpc('cw_claim_guest_comments',{p_user:user,p_hash:hash});if(r.error)throw r.error;
 context.cookies.delete('cw_guest_updates',{path:'/'});
}
