import type {APIRoute} from 'astro';
import {guestToken,claimGuestComments} from '../../server/guest-comments';
import {currentUser,cookieOptions,json,origin} from '../../server/auth';
import {database,ensureMember} from '../../server/database';
import {sameOrigin} from '../../server/security.mjs';
export const POST:APIRoute=async context=>{
 if(!sameOrigin(context.request,origin(context)))return json({error:'Request not allowed.'},403);
 try{if(!guestToken(context))return json({error:'The guest-comment link expired. Contact us if you need help.'},400);
  context.cookies.set('cw_guest_updates','yes',{...cookieOptions(context),maxAge:600});
  const user=await currentUser(context);if(user?.emailVerified){const member=await ensureMember(user);await claimGuestComments(context,database(),member.id);return json({href:'/dashboard/notifications'});}
  return json({href:'/auth/sign-in?signup=1&next=%2Fdashboard%2Fnotifications'});
 }catch{return json({error:'Updates could not be connected. Please try again.'},503);}
};
