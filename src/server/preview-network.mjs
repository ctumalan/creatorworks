import { lookup } from 'node:dns/promises';
import http from 'node:http';
import https from 'node:https';
import { gunzipSync, inflateSync, brotliDecompressSync } from 'node:zlib';
import ipaddr from 'ipaddr.js';

export function previewUrl(value) {
 if(typeof value!=='string'||value.length>2000)throw Error('Invalid website link');
 const url=new URL(value);
 if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.port)throw Error('Use a public http or https website');
 const host=url.hostname.toLowerCase();
 if(!host.includes('.')||host.endsWith('.')||/\.(localhost|local|internal|lan|test|invalid|example)$/.test(host)||host==='localhost'||host.startsWith('[')||ipaddr.isValid(host))throw Error('Only public websites can be captured');
 url.hash='';return url;
}
export function publicAddress(address) {
 try {let parsed=ipaddr.parse(address);if(parsed.kind()==='ipv6'&&parsed.isIPv4MappedAddress())parsed=parsed.toIPv4Address();return parsed.range()==='unicast';}catch{return false;}
}
export async function resolvePublic(hostname,resolver=lookup) {
 const addresses=await resolver(hostname,{all:true,verbatim:true});
 if(!addresses.length||addresses.some(item=>!publicAddress(item.address)))throw Error('This address cannot be captured');
 return addresses[0];
}
export async function fetchPreviewAsset(value,budget,redirects=0,dependencies={}) {
 if(++budget.requests>45||Date.now()>budget.deadline||redirects>3)throw Error('Capture limit reached');
 const url=previewUrl(value);
 const address=await Promise.race([resolvePublic(url.hostname,dependencies.lookup||lookup),new Promise((_,reject)=>setTimeout(()=>reject(Error('DNS timeout')),1500).unref())]);
 const result=await new Promise((resolve,reject)=>{
  const request=(dependencies.request||(url.protocol==='https:'?https:http).request)(url,{
   method:'GET',agent:false,headers:{'User-Agent':'CreatorWorksPreview/1.0','Accept':'text/html,text/css,image/*,font/*;q=0.9,*/*;q=0.5','Accept-Encoding':'identity'},
   // Pin the validated IP; never let a second DNS lookup bypass the SSRF check.
   lookup:(_host,options,callback)=>options.all?callback(null,[address]):callback(null,address.address,address.family),
  },response=>{
   const status=response.statusCode||500;
   if(status>=300&&status<400&&response.headers.location){response.destroy();resolve({redirect:new URL(response.headers.location,url).href});return;}
   if(status<200||status>=300){response.destroy();reject(Error('Website did not return a public page'));return;}
   const chunks=[];let size=0;
   response.on('data',chunk=>{
    size+=chunk.length;budget.bytes+=chunk.length;
    if(size>3_000_000||budget.bytes>14_000_000||Date.now()>budget.deadline)request.destroy(Error('Website is too large to capture'));
    else chunks.push(chunk);
   });
   response.on('end',()=>{
    try{
     let body=Buffer.concat(chunks);const encoding=response.headers['content-encoding'];
     if(encoding==='gzip')body=gunzipSync(body,{maxOutputLength:3_000_000});
     else if(encoding==='deflate')body=inflateSync(body,{maxOutputLength:3_000_000});
     else if(encoding==='br')body=brotliDecompressSync(body,{maxOutputLength:3_000_000});
     else if(encoding&&encoding!=='identity')throw Error('Unsupported response');
     budget.bytes+=Math.max(0,body.length-size);if(budget.bytes>14_000_000)throw Error('Capture limit reached');
     resolve({body,status,contentType:response.headers['content-type']||'application/octet-stream',url:url.href});
    }catch(error){reject(error);}
   });response.on('error',reject);
  });
  const timer=setTimeout(()=>request.destroy(Error('Website timed out')),Math.max(1,Math.min(4000,budget.deadline-Date.now())));
  request.on('close',()=>clearTimeout(timer));request.on('error',reject);request.end();
 });
 return result.redirect?fetchPreviewAsset(result.redirect,budget,redirects+1,dependencies):result;
}
