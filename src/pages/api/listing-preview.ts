import type { APIRoute } from 'astro';
import { json,origin } from '../../server/auth';
import { sameOrigin } from '../../server/security.mjs';
import { previewUrl } from '../../server/preview-network.mjs';
import { capturePreview } from '../../server/preview-capture.mjs';
import { currentUser } from '../../server/auth';
import { allowRequest } from '../../server/abuse';
export const POST:APIRoute=async context=>{
 if(!sameOrigin(context.request,origin(context)))return json({error:'Request not allowed.'},403);
 try{
  const user=await currentUser(context);
  if(!user)return json({error:'Sign in for automatic screenshots, or upload your own image.'},401);
  if(!user.emailVerified)return json({error:'Verify your email to use automatic screenshots.'},403);
  // Database-backed counters work across concurrent serverless instances; fail closed.
  if(!await allowRequest(user.id,'listing-preview',3,60)||!await allowRequest(user.id,'listing-preview-day',20,86400))return json({error:'Screenshot limit reached. Upload an image or try again later.'},429);
  const raw=await context.request.text();if(raw.length>5000)return json({error:'Link is too long.'},413);
  let url;try{url=previewUrl(JSON.parse(raw).url).href;}catch{return json({error:'Enter a public http or https website link.'},400);}
  return json(await capturePreview(url));
 }catch{return json({error:'We couldn’t capture this page. It may require sign-in or block previews. Upload a screenshot, retry, or continue without an image.'},422);}
};
