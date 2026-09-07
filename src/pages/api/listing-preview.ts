import type { APIRoute } from 'astro';
import { json,origin } from '../../server/auth';
import { sameOrigin } from '../../server/security.mjs';
import { previewUrl } from '../../server/preview-network.mjs';
import { capturePreview } from '../../server/preview-capture.mjs';
const attempts=new Map<string,{count:number,until:number}>();
export const POST:APIRoute=async context=>{
 if(!sameOrigin(context.request,origin(context)))return json({error:'Request not allowed.'},403);
 try{
  const raw=await context.request.text();if(raw.length>5000)return json({error:'Link is too long.'},413);
  let url;try{url=previewUrl(JSON.parse(raw).url).href;}catch{return json({error:'Enter a public http or https website link.'},400);}
  const ip=context.request.headers.get('x-vercel-forwarded-for')||context.clientAddress||'local';
  const now=Date.now();for(const [key,item] of attempts)if(item.until<now)attempts.delete(key);
  if(attempts.size>2000)return json({error:'Preview capture is busy. Please upload a screenshot or try later.'},429);
  const entry=attempts.get(ip)||{count:0,until:now+60000};
  if(entry.count>=3)return json({error:'Please wait a minute before retrying, or upload your screenshot.'},429);
  entry.count++;attempts.set(ip,entry);
  return json(await capturePreview(url));
 }catch{return json({error:'We couldn’t capture this page. It may require sign-in or block previews. Upload a screenshot, retry, or continue without an image.'},422);}
};
